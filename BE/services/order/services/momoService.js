const axios = require('axios');
const crypto = require('crypto-js');
const momoConfig = require('../../../config/momo');
const logger = require('../../../utils/logger');

/**
 * Tạo chữ ký cho yêu cầu thanh toán MoMo
 * @param {Object} requestBody - Nội dung yêu cầu thanh toán
 * @returns {string} - Chữ ký đã tạo
 */
const createSignature = (requestBody) => {
  try {
    // Tạo bản sao để không ảnh hưởng đến object gốc
    const dataToSign = {...requestBody};
    
    // Loại bỏ các trường không cần thiết trong chữ ký
    delete dataToSign.signature;  // Loại bỏ signature nếu có
    delete dataToSign.lang;       // MoMo không yêu cầu trường lang trong chữ ký
    
    // Sắp xếp các tham số theo thứ tự a-z
    const sortedKeys = Object.keys(dataToSign).sort();
    const rawSignatureItems = [];
    
    for (const key of sortedKeys) {
      if (dataToSign[key] !== undefined && dataToSign[key] !== null) {
        rawSignatureItems.push(`${key}=${dataToSign[key]}`);
      }
    }
    
    const rawSignature = rawSignatureItems.join('&');
    
    logger.info(`Raw signature: ${rawSignature}`);
    
    // Tạo chữ ký bằng HMAC SHA256
    const signature = crypto.HmacSHA256(rawSignature, momoConfig.partner.secretKey);
    
    // Chuyển đổi sang chuỗi hexa
    return signature.toString(crypto.enc.Hex);
  } catch (error) {
    logger.error(`Lỗi tạo chữ ký: ${error.message}`);
    throw new Error(`Không thể tạo chữ ký: ${error.message}`);
  }
};

/**
 * Tạo yêu cầu thanh toán QR MoMo
 * @param {string} orderId - Mã đơn hàng đặt bàn
 * @param {string} orderInfo - Thông tin đơn hàng
 * @param {number} amount - Số tiền thanh toán
 * @param {string} redirectUrl - URL chuyển hướng sau khi thanh toán
 * @param {string} ipnUrl - URL nhận IPN callback
 * @returns {Promise<Object>} - Kết quả từ MoMo
 */
const createPayment = async (orderId, orderInfo, amount, extraData = '', redirectUrl = null, ipnUrl = null) => {
  try {
    // Đảm bảo amount là số nguyên và chuyển thành chuỗi
    const amountInt = Math.floor(Number(amount));
    
    // Kiểm tra số tiền
    if (isNaN(amountInt) || amountInt <= 0) {
      throw new Error(`Số tiền không hợp lệ: ${amount}. Cần có số tiền dương.`);
    }
    
    // Tạo mã giao dịch theo yêu cầu của MoMo
    const requestId = `${orderId}_${Date.now()}`;
    const encodedExtraData = Buffer.from(extraData || '').toString('base64');

    // Chuẩn bị dữ liệu thanh toán - KHÔNG bao gồm lang
    const requestBody = {
      partnerCode: momoConfig.partner.partnerCode,
      accessKey: momoConfig.partner.accessKey,
      requestId: requestId,
      amount: amountInt.toString(),
      orderId: orderId,
      orderInfo: orderInfo || 'Thanh toán qua MoMo',
      redirectUrl: redirectUrl || momoConfig.app.redirectUrl,
      ipnUrl: ipnUrl || momoConfig.app.ipnUrl,
      extraData: encodedExtraData,
      requestType: 'captureWallet'
    };
    
    // In ra thông tin cấu hình để debug
    logger.info(`Sử dụng MoMo PartnerCode: ${momoConfig.partner.partnerCode}`);
    logger.info(`Sử dụng MoMo AccessKey: ${momoConfig.partner.accessKey.substring(0, 3)}...`);
    logger.info(`Sử dụng MoMo SecretKey: ${momoConfig.partner.secretKey.substring(0, 3)}...`);

    // Tạo chữ ký
    requestBody.signature = createSignature(requestBody);
    
    // Thêm ngôn ngữ sau khi đã tạo chữ ký
    requestBody.lang = 'vi';
    
    // Log để debug, nhưng che thông tin mật
    const debugRequestBody = {...requestBody};
    debugRequestBody.accessKey = '***';
    logger.info(`Gửi yêu cầu thanh toán MoMo: ${JSON.stringify(debugRequestBody, null, 2)}`);
    
    // Kiểm tra URL endpoint
    const endpoint = momoConfig.api.endpoint;
    if (!endpoint || !endpoint.startsWith('http')) {
      throw new Error(`MoMo API endpoint không hợp lệ: ${endpoint}`);
    }
    
    logger.info(`Gọi MoMo API endpoint: ${endpoint}`);
    
    // Gọi API MoMo với timeout
    const response = await axios.post(
      endpoint,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(requestBody))
        },
        timeout: 30000 // Timeout 30 giây
      }
    );
    
    logger.info(`Kết quả từ MoMo: ${JSON.stringify(response.data, null, 2)}`);
    
    // Kiểm tra kết quả và bổ sung thông tin QR nếu cần
    if (response.data.resultCode === 0) {
      // Đảm bảo có giá trị cho payUrl
      if (!response.data.payUrl) {
        logger.warn('MoMo không trả về payUrl, tạo giá trị mặc định');
        response.data.payUrl = response.data.deeplink || `https://test-payment.momo.vn?orderId=${orderId}`;
      }
      
      // Đảm bảo có giá trị cho qrCodeUrl - tùy chọn có thể bỏ qua vì front-end sẽ tạo QR từ payUrl
      if (!response.data.qrCodeUrl) {
        logger.info('MoMo không trả về qrCodeUrl, frontend sẽ tạo QR code từ payUrl');
      }
      
      // Lưu lại thông tin gốc từ MoMo
      response.data.originalRequestId = requestId;
      response.data.originalOrderId = orderId;
      response.data.originalAmount = amountInt;
    } else {
      logger.error(`MoMo trả về lỗi: ${response.data.message} (Mã: ${response.data.resultCode})`);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Lỗi từ API MoMo
      logger.error(`Lỗi từ MoMo API: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      return {
        resultCode: error.response.status,
        message: error.response.data?.message || error.message,
        error: error.response.data
      };
    }
    
    logger.error(`Lỗi tạo thanh toán MoMo: ${error.message}`);
    throw new Error(`Lỗi tạo thanh toán MoMo: ${error.message}`);
  }
};

/**
 * Kiểm tra thông tin thanh toán
 * @param {string} orderId - Mã đơn hàng 
 * @param {string} requestId - Mã yêu cầu
 * @returns {Promise<Object>} - Kết quả trạng thái thanh toán
 */
const checkPaymentStatus = async (orderId, requestId) => {
  try {
    // Chuẩn bị dữ liệu kiểm tra
    const requestBody = {
      partnerCode: momoConfig.partner.partnerCode,
      accessKey: momoConfig.partner.accessKey,
      requestId: requestId,
      orderId: orderId
    };
    
    // Tạo chữ ký
    requestBody.signature = createSignature(requestBody);
    
    // Thêm ngôn ngữ sau khi đã tạo chữ ký
    requestBody.lang = 'vi';
    
    // Log để debug, nhưng che thông tin mật
    const debugRequestBody = {...requestBody};
    debugRequestBody.accessKey = '***';
    logger.info(`Kiểm tra trạng thái thanh toán MoMo: ${JSON.stringify(debugRequestBody)}`);
    
    // Gọi API MoMo để kiểm tra trạng thái
    const response = await axios.post(
      momoConfig.api.queryEndpoint,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(requestBody))
        },
        timeout: 30000 // Timeout 30 giây
      }
    );
    
    logger.info(`Kết quả kiểm tra trạng thái MoMo: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    logger.error(`Lỗi kiểm tra trạng thái thanh toán MoMo: ${error.message}`);
    throw new Error(`Lỗi kiểm tra trạng thái thanh toán MoMo: ${error.message}`);
  }
};

/**
 * Xác minh chữ ký IPN từ MoMo
 * @param {Object} requestBody - Dữ liệu nhận từ MoMo IPN
 * @returns {boolean} - Kết quả xác minh
 */
const verifyIpnSignature = (requestBody) => {
  try {
    // Lấy chữ ký từ request
    const receivedSignature = requestBody.signature;
    if (!receivedSignature) {
      logger.error('Không tìm thấy chữ ký trong request IPN');
      return false;
    }
    
    // Tạo đối tượng mới không chứa signature và lang
    const verifyData = {...requestBody};
    delete verifyData.signature;
    delete verifyData.lang;
    
    // Log để debug
    logger.info(`Dữ liệu IPN cần xác minh: ${JSON.stringify(verifyData, null, 2)}`);
    
    // Tạo chữ ký để so sánh
    const calculatedSignature = createSignature(verifyData);
    
    // So sánh chữ ký
    const isValid = receivedSignature === calculatedSignature;
    logger.info(`Chữ ký nhận từ MoMo: ${receivedSignature}`);
    logger.info(`Chữ ký tính toán:    ${calculatedSignature}`);
    logger.info(`Kết quả xác minh chữ ký IPN: ${isValid ? 'Hợp lệ' : 'Không hợp lệ'}`);
    
    return isValid;
  } catch (error) {
    logger.error(`Lỗi xác minh chữ ký IPN MoMo: ${error.message}`);
    return false;
  }
};

/**
 * Hoàn tiền thanh toán MoMo
 * @param {string} orderId - Mã đơn hàng ban đầu
 * @param {string} transId - Mã giao dịch MoMo cần hoàn tiền
 * @param {number} amount - Số tiền hoàn trả
 * @param {string} description - Mô tả lý do hoàn tiền
 * @returns {Promise<Object>} - Kết quả hoàn tiền từ MoMo
 */
const refundPayment = async (orderId, transId, amount, description) => {
  try {
    // Tạo mã yêu cầu hoàn tiền
    const requestId = `REFUND_${orderId}_${Date.now()}`;
    
    // Chuẩn bị dữ liệu hoàn tiền
    const requestBody = {
      partnerCode: momoConfig.partner.partnerCode,
      accessKey: momoConfig.partner.accessKey,
      requestId: requestId,
      amount: amount.toString(),
      orderId: `REFUND_${orderId}_${Date.now()}`, // Tạo orderId mới cho lệnh hoàn tiền
      transId: transId,
      description: description || `Hoàn tiền cho đơn hàng ${orderId}`
    };
    
    // Tạo chữ ký
    requestBody.signature = createSignature(requestBody);
    
    // Thêm ngôn ngữ sau khi đã tạo chữ ký
    requestBody.lang = 'vi';
    
    // Log để debug, nhưng che thông tin mật
    const debugRequestBody = {...requestBody};
    debugRequestBody.accessKey = '***';
    logger.info(`Gửi yêu cầu hoàn tiền MoMo: ${JSON.stringify(debugRequestBody)}`);
    
    // Gọi API MoMo hoàn tiền
    const response = await axios.post(
      momoConfig.api.refundEndpoint,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(requestBody))
        },
        timeout: 30000 // Timeout 30 giây
      }
    );
    
    logger.info(`Kết quả hoàn tiền từ MoMo: ${JSON.stringify(response.data)}`);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Lỗi từ API MoMo
      logger.error(`Lỗi hoàn tiền MoMo API: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      return {
        resultCode: error.response.status,
        message: error.response.data?.message || error.message,
        error: error.response.data
      };
    }
    
    logger.error(`Lỗi hoàn tiền MoMo: ${error.message}`);
    throw new Error(`Lỗi hoàn tiền MoMo: ${error.message}`);
  }
};

module.exports = {
  createPayment,
  checkPaymentStatus,
  verifyIpnSignature,
  refundPayment
}; 