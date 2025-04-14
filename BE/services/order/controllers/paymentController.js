const { v4: uuidv4 } = require('uuid');
const ThongTinDatBan = require('../models/ThongTinDatBan');
const Payment = require('../models/Payment');
const momoService = require('../services/momoService');
const logger = require('../../../utils/logger');

/**
 * Tạo thanh toán qua MoMo
 */
exports.createMomoPayment = async (req, res) => {
  try {
    const { datBanId } = req.params;
    
    // Thêm log để kiểm tra dữ liệu đầu vào
    logger.info(`Bắt đầu tạo thanh toán MoMo với datBanId: ${datBanId}, kiểu: ${typeof datBanId}`);
    
    // Kiểm tra nếu ID không được cung cấp
    if (!datBanId) {
      logger.error('ID đặt bàn không được cung cấp');
      return res.status(400).json({
        success: false,
        message: 'ID đặt bàn không được cung cấp'
      });
    }

    // Kiểm tra định dạng ID hợp lệ
    if (!datBanId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.error(`ID đặt bàn không hợp lệ: ${datBanId}`);
      return res.status(400).json({
        success: false,
        message: 'ID đặt bàn không hợp lệ, phải là MongoDB ObjectId (24 ký tự hex)'
      });
    }
    
    try {
      // Kiểm tra đặt bàn có tồn tại không
      const datBan = await ThongTinDatBan.findById(datBanId);
      
      // Log kết quả truy vấn
      logger.info(`Kết quả tìm đặt bàn: ${datBan ? 'Tìm thấy' : 'Không tìm thấy'}`);
      
      if (!datBan) {
        logger.error(`Không tìm thấy thông tin đặt bàn với ID: ${datBanId}`);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin đặt bàn'
        });
      }
      
      // Log thông tin đặt bàn
      logger.info(`Tìm thấy thông tin đặt bàn: ${datBan._id}, Tên: ${datBan.hoTen}, Nhà hàng: ${datBan.nhaHang}`);
      
      // Kiểm tra xem đã thanh toán chưa
      if (datBan.thanhToan && datBan.thanhToan.trangThai === 'Đã thanh toán') {
        logger.warn(`Đơn đặt bàn ${datBanId} đã được thanh toán trước đó`);
        return res.status(400).json({
          success: false,
          message: 'Đơn đặt bàn này đã được thanh toán'
        });
      }

      // Tạo mã giao dịch duy nhất
      const orderId = `DATBAN_${datBanId.toString().slice(-8)}_${Date.now()}`;
      logger.info(`Tạo mã giao dịch: ${orderId}`);
      
      // Tạo thông tin thanh toán
      const orderInfo = `Thanh toán đặt bàn tại ${datBan.nhaHang || 'Manwah'}`;
      
      // Kiểm tra số tiền
      let amount = datBan.tongTien;
      if (!amount || amount <= 0) {
        // Nếu không có tổng tiền, tính từ các món ăn đặt
        if (datBan.monAnDat && datBan.monAnDat.length > 0) {
          amount = datBan.monAnDat.reduce((total, item) => {
            return total + (item.gia * item.soLuong);
          }, 0);
        }
        
        // Nếu vẫn không có, sử dụng số mặc định
        if (!amount || amount <= 0) {
          amount = 10000; // Số tiền mặc định nếu không có
        }
      }
      
      logger.info(`Số tiền thanh toán: ${amount}`);
      
      // Dữ liệu bổ sung (sẽ được trả lại trong IPN)
      const extraData = JSON.stringify({
        datBanId: datBan._id.toString(),
        hoTen: datBan.hoTen,
        soDienThoai: datBan.soDienThoai
      });
      
      // Gọi service MoMo để tạo giao dịch
      logger.info(`Chuẩn bị gọi API MoMo với orderId=${orderId}, amount=${amount}`);
      
      try {
        const momoResponse = await momoService.createPayment(
          orderId,
          orderInfo,
          amount,
          extraData
        );
        
        // Kiểm tra kết quả từ MoMo
        if (momoResponse && momoResponse.resultCode === 0) {
          logger.info(`Tạo thanh toán MoMo thành công, payUrl: ${momoResponse.payUrl}`);
          
          try {
            // Lưu thông tin thanh toán vào cơ sở dữ liệu
            const payment = await Payment.create({
              datBanId: datBan._id,
              hoTen: datBan.hoTen,
              soDienThoai: datBan.soDienThoai,
              email: datBan.email,
              phuongThuc: 'momo',
              soTien: amount,
              orderId: orderId,
              requestId: momoResponse.requestId,
              trangThai: 'pending',
              thongTinGiaoDich: momoResponse,
              moTa: orderInfo,
              payUrl: momoResponse.payUrl,
              deeplink: momoResponse.deeplink || null,
              qrCodeUrl: momoResponse.qrCodeUrl || null
            });
            
            logger.info(`Đã lưu thông tin thanh toán với ID: ${payment._id}`);
            
            // Cập nhật thông tin đặt bàn với trạng thái thanh toán
            datBan.thanhToan = {
              trangThai: 'Đang xử lý',
              phuongThuc: 'MoMo',
              payment: payment._id
            };
            
            await datBan.save();
            logger.info(`Đã cập nhật trạng thái đặt bàn thành "Đang xử lý"`);
            
            // Trả về thông tin thanh toán cho client
            return res.status(200).json({
              success: true,
              message: 'Đã tạo thanh toán MoMo thành công',
              data: {
                paymentId: payment._id,
                payUrl: momoResponse.payUrl || `https://test-payment.momo.vn/pay?orderId=${orderId}`,
                deeplink: momoResponse.deeplink || null,
                qrCodeUrl: momoResponse.qrCodeUrl || null,
                orderId: orderId,
                amount: amount,
                extraData: extraData
              }
            });
          } catch (dbError) {
            logger.error(`Lỗi lưu thông tin thanh toán: ${dbError.message}`);
            return res.status(500).json({
              success: false,
              message: 'Đã tạo thanh toán MoMo thành công nhưng không thể lưu thông tin',
              error: dbError.message,
              momoData: {
                payUrl: momoResponse.payUrl,
                orderId: orderId
              }
            });
          }
        } else {
          // Xử lý lỗi từ MoMo
          logger.error(`Lỗi tạo giao dịch MoMo: ${JSON.stringify(momoResponse)}`);
          
          // Trích xuất thông tin lỗi từ MoMo
          const errorMessage = momoResponse.message || 'Không thể tạo thanh toán với MoMo';
          const errorCode = momoResponse.resultCode || 'unknown';
          
          return res.status(400).json({
            success: false,
            message: `Lỗi từ MoMo: ${errorMessage} (mã lỗi: ${errorCode})`,
            error: momoResponse
          });
        }
      } catch (momoError) {
        logger.error(`Lỗi gọi MoMo API: ${momoError.message}`);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi gọi API MoMo',
          error: momoError.message
        });
      }
    } catch (dbError) {
      // Xử lý lỗi database
      logger.error(`Lỗi database khi tìm hoặc cập nhật đặt bàn: ${dbError.message}`);
      logger.error(dbError.stack);
      return res.status(500).json({
        success: false, 
        message: 'Lỗi khi tìm thông tin đặt bàn trong database',
        error: dbError.message
      });
    }
  } catch (error) {
    // Log chi tiết các lỗi
    logger.error(`Lỗi thanh toán MoMo: ${error.message}`);
    logger.error(error.stack);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo thanh toán',
      error: error.message
    });
  }
};

/**
 * Xử lý callback từ MoMo (khi người dùng được redirect lại)
 */
exports.handleMomoCallback = async (req, res) => {
  try {
    // Thông tin từ query param
    const { orderId, resultCode, message, extraData } = req.query;
    
    logger.info(`Nhận MoMo callback: ${JSON.stringify(req.query)}`);
    
    // Tạo URL redirect mặc định cho FE
    const baseRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let redirectUrl = `${baseRedirectUrl}/payment`;
    
    try {
      // Kiểm tra xem thanh toán có tồn tại không
      const payment = await Payment.findOne({ orderId });
      
      if (!payment) {
        logger.error(`Không tìm thấy thanh toán với orderId: ${orderId}`);
        redirectUrl = `${baseRedirectUrl}/payment/error?message=${encodeURIComponent('Không tìm thấy thông tin thanh toán')}&code=404`;
      } else {
        logger.info(`Tìm thấy thanh toán: ${payment._id}`);
        
        // Cập nhật thông tin từ MoMo
        payment.thongTinGiaoDich = {
          ...payment.thongTinGiaoDich,
          callback: req.query
        };
        
        // Kiểm tra kết quả từ MoMo
        if (resultCode === '0' || resultCode === 0) {
          // Thanh toán thành công
          payment.trangThai = 'success';
          payment.ngayThanhToan = new Date();
          await payment.save();
          logger.info(`Đã cập nhật thanh toán thành công: ${payment._id}`);
          
          // Cập nhật đơn đặt bàn
          try {
            const datBan = await ThongTinDatBan.findById(payment.datBanId);
            
            if (datBan) {
              datBan.thanhToan.trangThai = 'Đã thanh toán';
              datBan.thanhToan.ngayThanhToan = new Date();
              await datBan.save();
              logger.info(`Đã cập nhật trạng thái đặt bàn thành công: ${payment.datBanId}`);
            } else {
              logger.warn(`Không tìm thấy thông tin đặt bàn với ID: ${payment.datBanId}`);
            }
          } catch (datBanError) {
            logger.error(`Lỗi cập nhật đặt bàn: ${datBanError.message}`);
          }
          
          // URL chuyển hướng thành công
          redirectUrl = `${baseRedirectUrl}/payment/success?orderId=${orderId}`;
        } else {
          // Thanh toán thất bại
          payment.trangThai = 'failed';
          await payment.save();
          logger.info(`Đã cập nhật thanh toán thất bại: ${payment._id}`);
          
          // Cập nhật đơn đặt bàn
          try {
            const datBan = await ThongTinDatBan.findById(payment.datBanId);
            
            if (datBan) {
              datBan.thanhToan.trangThai = 'Thanh toán lỗi';
              await datBan.save();
              logger.info(`Đã cập nhật trạng thái đặt bàn thất bại: ${payment.datBanId}`);
            }
          } catch (datBanError) {
            logger.error(`Lỗi cập nhật đặt bàn: ${datBanError.message}`);
          }
          
          // URL chuyển hướng thất bại
          redirectUrl = `${baseRedirectUrl}/payment/error?orderId=${orderId}&message=${encodeURIComponent(message || 'Thanh toán thất bại')}`;
        }
      }
    } catch (dbError) {
      logger.error(`Lỗi xử lý database trong callback: ${dbError.message}`);
      redirectUrl = `${baseRedirectUrl}/payment/error?message=${encodeURIComponent('Lỗi xử lý thanh toán')}&code=500`;
    }
    
    logger.info(`Chuyển hướng người dùng đến: ${redirectUrl}`);
    
    // Chuyển hướng người dùng về ứng dụng Frontend
    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error(`Lỗi xử lý callback MoMo: ${error.message}`);
    const baseRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${baseRedirectUrl}/payment/error?message=${encodeURIComponent('Đã xảy ra lỗi khi xử lý thanh toán')}`);
  }
};

/**
 * Xử lý IPN (Instant Payment Notification) từ MoMo
 * IPN là webhook để MoMo thông báo kết quả giao dịch về ứng dụng
 */
exports.handleMomoIPN = async (req, res) => {
  try {
    // In ra toàn bộ request body để debug
    console.log('[PAYMENT GATEWAY] Received response from Order service:', req.method);
    console.log('[PAYMENT GATEWAY] Response body:', JSON.stringify(req.body, null, 2));
    
    // Kiểm tra dữ liệu từ MoMo
    if (!req.body || !req.body.signature) {
      logger.error('IPN không hợp lệ: Thiếu thông tin hoặc chữ ký');
      return res.status(400).json({
        success: false,
        message: 'IPN không hợp lệ: Thiếu thông tin hoặc chữ ký'
      });
    }
    
    // Xác minh chữ ký từ MoMo
    const isValidSignature = momoService.verifyIpnSignature(req.body);
    
    if (!isValidSignature) {
      logger.error('IPN không hợp lệ: Chữ ký không khớp');
      return res.status(400).json({
        success: false,
        message: 'IPN không hợp lệ: Chữ ký không khớp'
      });
    }
    
    // Sau khi đã xác minh chữ ký thành công, xử lý dữ liệu
    const { orderId, resultCode, message, extraData, transId, amount } = req.body;
    
    logger.info(`Nhận MoMo IPN: orderId=${orderId}, resultCode=${resultCode}, transId=${transId}`);
    
    // Tìm thông tin thanh toán
    const payment = await Payment.findOne({ orderId });
    
    if (!payment) {
      logger.error(`Không tìm thấy thanh toán với orderId: ${orderId}`);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin thanh toán'
      });
    }
    
    // Cập nhật thông tin từ MoMo
    payment.thongTinGiaoDich = {
      ...payment.thongTinGiaoDich,
      ipn: req.body
    };
    
    // Kiểm tra kết quả từ MoMo
    if (resultCode === 0 || resultCode === '0') {
      // Thanh toán thành công, cập nhật trạng thái
      payment.trangThai = 'success';
      payment.transId = transId;
      payment.ngayThanhToan = new Date();
      await payment.save();
      
      logger.info(`Cập nhật thanh toán thành công: ${payment._id}`);
      
      // Tìm và cập nhật thông tin đặt bàn
      const datBan = await ThongTinDatBan.findById(payment.datBanId);
      
      if (datBan) {
        // Cập nhật trạng thái thanh toán cho đặt bàn
        datBan.thanhToan = {
          trangThai: 'Đã thanh toán',
          phuongThuc: 'MoMo',
          payment: payment._id,
          soTien: amount,
          thoiGianThanhToan: new Date()
        };
        
        await datBan.save();
        logger.info(`Cập nhật trạng thái đặt bàn thành "Đã thanh toán": ${datBan._id}`);
        
        // Gửi thông báo qua Socket.IO
        try {
          const io = req.app.get('io');
          if (io) {
            // Gửi thông báo đến phòng nhà hàng
            if (datBan.nhaHang) {
              io.to(`restaurant_${datBan.nhaHang}`).emit('payment_completed', {
                datBanId: datBan._id,
                trangThai: 'Đã thanh toán',
                phuongThuc: 'MoMo',
                soTien: amount
              });
              
              logger.info(`Đã gửi thông báo thanh toán thành công đến nhà hàng: ${datBan.nhaHang}`);
            }
            
            // Gửi thông báo đến phòng admin
            io.to('admin_room').emit('payment_completed', {
              datBanId: datBan._id,
              trangThai: 'Đã thanh toán',
              phuongThuc: 'MoMo',
              soTien: amount
            });
          }
        } catch (socketError) {
          logger.error(`Lỗi gửi thông báo socket: ${socketError.message}`);
        }
      } else {
        logger.error(`Không tìm thấy thông tin đặt bàn: ${payment.datBanId}`);
      }
      
      // Trả về thành công cho MoMo
      return res.status(200).json({
        success: true,
        message: 'Đã tạo thanh toán thành công',
        data: {
          paymentId: payment._id,
          orderId: orderId
        }
      });
    } else {
      // Thanh toán thất bại
      payment.trangThai = 'failed';
      payment.thongTinLoi = {
        code: resultCode,
        message: message
      };
      await payment.save();
      
      logger.error(`Thanh toán thất bại: ${orderId}, mã lỗi: ${resultCode}, lý do: ${message}`);
      
      // Cập nhật thông tin đặt bàn
      const datBan = await ThongTinDatBan.findById(payment.datBanId);
      
      if (datBan) {
        // Cập nhật trạng thái thanh toán cho đặt bàn
        datBan.thanhToan = {
          trangThai: 'Thất bại',
          phuongThuc: 'MoMo',
          payment: payment._id,
          soTien: amount,
          thoiGianThanhToan: new Date(),
          thongTinLoi: {
            code: resultCode,
            message: message
          }
        };
        
        await datBan.save();
        logger.info(`Cập nhật trạng thái đặt bàn thành "Thất bại": ${datBan._id}`);
      }
      
      // Vẫn trả về 200 cho MoMo để tránh MoMo tiếp tục gửi lại IPN
      return res.status(200).json({
        success: false,
        message: `Thanh toán thất bại: ${message}`,
        data: {
          paymentId: payment._id,
          orderId: orderId,
          resultCode: resultCode
        }
      });
    }
  } catch (error) {
    logger.error(`Lỗi xử lý IPN: ${error.message}`);
    logger.error(error.stack);
    
    // Vẫn trả về 200 OK cho MoMo để tránh MoMo gửi lại IPN
    return res.status(200).json({
      success: false,
      message: `Lỗi xử lý IPN: ${error.message}`
    });
  }
};

/**
 * Kiểm tra trạng thái thanh toán
 */
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Tìm thông tin thanh toán trong cơ sở dữ liệu
    const payment = await Payment.findOne({ orderId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin thanh toán'
      });
    }
    
    // Nếu đã thành công hoặc thất bại rõ ràng, trả về ngay
    if (payment.trangThai === 'success' || payment.trangThai === 'failed' || payment.trangThai === 'cancelled') {
      return res.status(200).json({
        success: true,
        data: {
          orderId: payment.orderId,
          trangThai: payment.trangThai,
          ngayThanhToan: payment.ngayThanhToan
        }
      });
    }
    
    // Nếu đang chờ, kiểm tra với MoMo
    try {
      const momoResponse = await momoService.checkPaymentStatus(
        payment.orderId,
        payment.requestId
      );
      
      logger.info(`MoMo payment status response: ${JSON.stringify(momoResponse)}`);
      
      // Cập nhật trạng thái từ MoMo
      if (momoResponse.resultCode === 0) {
        if (momoResponse.extraData) {
          try {
            const extraDataStr = Buffer.from(momoResponse.extraData, 'base64').toString('utf8');
            payment.extraData = JSON.parse(extraDataStr);
          } catch (e) {
            logger.error(`Lỗi parse extraData: ${e.message}`);
          }
        }
        
        // Cập nhật thanh toán theo kết quả từ MoMo
        if (momoResponse.transId) {
          payment.transId = momoResponse.transId;
        }
        
        // Cập nhật trạng thái
        if (momoResponse.message === 'Success' || momoResponse.message === 'Thành công') {
          payment.trangThai = 'success';
          payment.ngayThanhToan = new Date();
          
          // Cập nhật đơn đặt bàn
          const datBan = await ThongTinDatBan.findById(payment.datBanId);
          
          if (datBan) {
            datBan.thanhToan.trangThai = 'Đã thanh toán';
            datBan.thanhToan.ngayThanhToan = new Date();
            await datBan.save();
          }
        } else if (momoResponse.message.includes('Cancelled')) {
          payment.trangThai = 'cancelled';
        }
        
        payment.thongTinGiaoDich = {
          ...payment.thongTinGiaoDich,
          statusResponse: momoResponse
        };
        
        await payment.save();
      }
      
      return res.status(200).json({
        success: true,
        data: {
          orderId: payment.orderId,
          trangThai: payment.trangThai,
          ngayThanhToan: payment.ngayThanhToan,
          momoResponse: momoResponse
        }
      });
    } catch (error) {
      logger.error(`Lỗi khi kiểm tra trạng thái thanh toán với MoMo: ${error.message}`);
      return res.status(200).json({
        success: true,
        data: {
          orderId: payment.orderId,
          trangThai: payment.trangThai,
          ngayThanhToan: payment.ngayThanhToan,
          error: 'Không thể kết nối với MoMo để kiểm tra trạng thái'
        }
      });
    }
  } catch (error) {
    logger.error(`Lỗi kiểm tra trạng thái thanh toán: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra trạng thái thanh toán',
      error: error.message
    });
  }
};

/**
 * Controller xử lý hoàn tiền MoMo
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Phản hồi JSON
 */
exports.refundMomoPayment = async (req, res) => {
  try {
    const { orderId, transId, amount, description } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!orderId || !transId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết để hoàn tiền',
        required: ['orderId', 'transId', 'amount']
      });
    }
    
    // Gọi service để thực hiện hoàn tiền
    const refundResult = await momoService.refundPayment(
      orderId,
      transId,
      amount,
      description
    );
    
    // Kiểm tra kết quả hoàn tiền
    if (refundResult.resultCode === 0) {
      return res.status(200).json({
        success: true,
        message: 'Hoàn tiền thành công',
        data: refundResult
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Hoàn tiền thất bại: ${refundResult.message}`,
        error: refundResult
      });
    }
  } catch (error) {
    console.error('Lỗi khi xử lý hoàn tiền MoMo:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xử lý hoàn tiền MoMo',
      error: error.message
    });
  }
}; 