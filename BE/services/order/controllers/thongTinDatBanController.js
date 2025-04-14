const ThongTinDatBan = require('../models/ThongTinDatBan');
const logger = require('../../../utils/logger');
const axios = require('axios');
const config = require('../../../config');

// Lấy danh sách đặt bàn với phân trang
exports.getAllThongTinDatBan = async (req, res) => {
  try {
    console.log("Request query:", req.query);
    
    // Tạo điều kiện tìm kiếm
    const filter = {};
    
    // Lọc theo trạng thái
    if (req.query.trangThai && req.query.trangThai !== 'all') {
      filter.trangThai = req.query.trangThai;
    }
    
    // Lọc theo nhà hàng
    if (req.query.nhaHang) {
      filter.nhaHang = req.query.nhaHang;
    }
    
    // Lọc theo ngày
    if (req.query.ngayDat) {
      const startDate = new Date(req.query.ngayDat);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.ngayDat);
      endDate.setHours(23, 59, 59, 999);
      
      filter.ngayDat = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Tạo sort options
    const sortOptions = {};
    
    if (req.query.sortBy && req.query.sortOrder) {
      sortOptions[req.query.sortBy] = req.query.sortOrder === 'asc' ? 1 : -1;
    } else {
      // Mặc định sắp xếp theo ngày tạo mới nhất
      sortOptions.createdAt = -1;
    }
    
    // Log filter và sort
    console.log("Filter:", filter);
    console.log("Sort options:", sortOptions);
    
    // Thêm phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Đếm tổng số bản ghi phù hợp với filter
    const total = await ThongTinDatBan.countDocuments(filter);
    
    // Lấy danh sách đặt bàn
    const thongTinDatBan = await ThongTinDatBan.find(filter)
      .populate('ban', 'soBan soChoNgoi')
      .populate('nguoiDat', 'hoTen soDienThoai email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Log kết quả trước khi trả về
    console.log(`Tìm thấy ${thongTinDatBan.length} kết quả, tổng ${total} bản ghi`);
    
    // Format lại dữ liệu trước khi trả về
    const formattedData = thongTinDatBan.map(item => {
      // Đảm bảo số lượng khách hiển thị đúng là tổng người lớn + trẻ em
      const soLuongNguoiLon = item.soLuongNguoiLon || 0;
      const soLuongTreEm = item.soLuongTreEm || 0;
      
      // Tính toán lại tổng số lượng khách
      const tongSoLuong = soLuongNguoiLon + soLuongTreEm;
      
      // Đảm bảo các trường số đều là số, không phải chuỗi
      return {
        ...item._doc,
        soLuongNguoiLon: soLuongNguoiLon,
        soLuongTreEm: soLuongTreEm,
        soLuongKhach: tongSoLuong,
        tongTien: Number(item.tongTien)
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedData,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đặt bàn:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đặt bàn: ' + error.message
    });
  }
};

// Lấy chi tiết đặt bàn
exports.getThongTinDatBanById = async (req, res) => {
  try {
    // Sửa để tránh lỗi populate
    const thongTinDatBan = await ThongTinDatBan.findById(req.params.id)
      .select('hoTen soDienThoai email nhaHang ngayDat gioDat soLuongKhach trangThai ghiChu tongTien createdAt updatedAt');
    
    // Bỏ populate tạm thời để tránh lỗi
    // .populate('nguoiDat', 'username fullName phoneNumber email')
    // .populate('ban', 'maBan viTri soLuongKhachToiDa')
    // .populate({
    //   path: 'monAnDat.monAn',
    //   select: 'tenMon gia hinhAnh'
    // });
    
    if (!thongTinDatBan) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }

    // Kiểm tra quyền truy cập (chỉ admin, staff hoặc chủ đơn có thể xem)
    // Bỏ quy tạm thời vì chúng ta không có thông tin nguoiDat
    // if (req.user.role === 'user' && (!thongTinDatBan.nguoiDat || thongTinDatBan.nguoiDat._id.toString() !== req.user.id)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Bạn không có quyền xem thông tin đặt bàn này'
    //   });
    // }

    res.status(200).json({
      success: true,
      data: thongTinDatBan
    });
  } catch (error) {
    logger.error(`Lỗi lấy chi tiết đặt bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết đặt bàn',
      error: error.message
    });
  }
};

// Lấy danh sách bàn có sẵn
exports.getAvailableBans = async (req, res) => {
  try {
    const { nhaHang, ngayDat, gioDat, soLuongKhach } = req.query;
    
    if (!nhaHang || !ngayDat || !gioDat || !soLuongKhach) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin nhà hàng, ngày, giờ và số lượng khách'
      });
    }

    try {
      // Gọi API kiểm tra bàn có sẵn từ restaurant service
      const response = await axios.get(`${config.serviceUrls.restaurant}/api/ban/check-availability`, {
        params: {
          nhaHang,
          ngayDat,
          gioDat,
          soLuongKhach
        }
      });
      
      return res.status(200).json(response.data);
    } catch (error) {
      logger.error(`Lỗi gọi API bàn có sẵn: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Không thể kiểm tra bàn có sẵn',
        error: error.message
      });
    }
  } catch (error) {
    logger.error(`Lỗi kiểm tra bàn có sẵn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra bàn có sẵn',
      error: error.message
    });
  }
};

// Tạo đặt bàn mới
exports.createThongTinDatBan = async (req, res) => {
  try {
    // Log thông tin đầu vào để debug
    console.log("Request body:", JSON.stringify(req.body));

    const {
      hoTen,
      soDienThoai,
      email,
      nhaHang,
      ban,
      ngayDat,
      gioDat,
      soLuongKhach,
      soLuongNguoiLon,
      soLuongTreEm,
      buffetNguoiLon,
      buffetTreEm,
      ghiChu,
      monAnDat,
      tongTien: requestTongTien
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!hoTen || !soDienThoai || !nhaHang || !ngayDat || !gioDat) {
      console.log("Thiếu thông tin bắt buộc:", {
        hoTen, soDienThoai, nhaHang, ngayDat, gioDat
      });
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin đặt bàn'
      });
    }

    // Format lại ngày tháng nếu cần
    const parsedDate = new Date(ngayDat);
    if (isNaN(parsedDate.getTime())) {
      console.log("Ngày không hợp lệ:", ngayDat);
      return res.status(400).json({
        success: false,
        message: 'Ngày đặt không hợp lệ'
      });
    }

    // Tính toán lại tổng số khách
    console.log("Trước khi chuyển đổi:", {
      soLuongKhach: req.body.soLuongKhach,
      soLuongNguoiLon: req.body.soLuongNguoiLon,
      soLuongTreEm: req.body.soLuongTreEm,
      types: {
        soLuongKhach: typeof req.body.soLuongKhach,
        soLuongNguoiLon: typeof req.body.soLuongNguoiLon,
        soLuongTreEm: typeof req.body.soLuongTreEm
      }
    });
    
    // Chuyển đổi và tính tổng số lượng khách
    const soLuongNguoiLonNumber = parseInt(req.body.soLuongNguoiLon || 0);
    const soLuongTreEmNumber = parseInt(req.body.soLuongTreEm || 0);
    const totalGuests = soLuongNguoiLonNumber + soLuongTreEmNumber;
    
    // Sử dụng tổng từ trước nếu có, nếu không tính lại
    const calculatedSoLuongKhach = req.body.soLuongKhach 
      ? parseInt(req.body.soLuongKhach) 
      : totalGuests;
    
    console.log("Sau khi chuyển đổi:", {
      soLuongNguoiLonNumber,
      soLuongTreEmNumber,
      totalGuests,
      calculatedSoLuongKhach
    });
    
    // Tính tổng tiền
    let finalTongTien = requestTongTien || 0;
    
    // Nếu không có giá trị tongTien từ request nhưng có monAnDat, tính lại tổng tiền
    if (!requestTongTien && monAnDat && monAnDat.length > 0) {
      monAnDat.forEach(item => {
        finalTongTien += item.gia * item.soLuong;
      });
    }

    // Lưu thông tin người đặt nếu đã đăng nhập
    const nguoiDat = req.user ? req.user.id : null;
    console.log("User info:", nguoiDat);

    console.log("Chuẩn bị tạo đặt bàn với thông tin:", {
      hoTen, soDienThoai, email, nhaHang, ban, ngayDat, 
      gioDat, soLuongKhach: calculatedSoLuongKhach, 
      soLuongNguoiLon: soLuongNguoiLonNumber,
      soLuongTreEm: soLuongTreEmNumber,
      tongTien: finalTongTien, nguoiDat
    });

    const thongTinDatBan = await ThongTinDatBan.create({
      hoTen,
      soDienThoai,
      email,
      nhaHang,
      ban,
      ngayDat: parsedDate,
      gioDat,
      soLuongKhach: calculatedSoLuongKhach,
      soLuongNguoiLon: soLuongNguoiLonNumber,
      soLuongTreEm: soLuongTreEmNumber,
      buffetNguoiLon,
      buffetTreEm,
      ghiChu,
      monAnDat,
      tongTien: finalTongTien,
      nguoiDat
    });

    console.log("Đã tạo đặt bàn thành công, ID:", thongTinDatBan._id);

    // Cập nhật trạng thái bàn nếu có chọn bàn
    if (ban) {
      try {
        const headers = req.headers.authorization ? { Authorization: req.headers.authorization } : {};
        console.log("Cập nhật trạng thái bàn:", ban);
        
        await axios.put(`${config.serviceUrls.restaurant}/api/ban/${ban}`, {
          trangThai: 'Đang sử dụng'
        }, {
          headers
        });
        console.log("Đã cập nhật trạng thái bàn thành công");
      } catch (error) {
        console.log("Lỗi cập nhật bàn:", error.message);
        logger.error(`Lỗi cập nhật trạng thái bàn: ${error.message}`);
        // Không ảnh hưởng đến việc đặt bàn thành công
      }
    }

    // Sau khi lưu thông tin đặt bàn thành công
    const savedThongTinDatBan = await thongTinDatBan.save();
    
    // Gửi thông báo qua Socket.IO nếu có
    const io = req.app.get('io');
    if (io) {
      // Thông báo cho admin và nhân viên nhà hàng
      const notificationData = {
        id: savedThongTinDatBan._id,
        hoTen: savedThongTinDatBan.hoTen,
        nhaHang: savedThongTinDatBan.nhaHang,
        ngayDat: savedThongTinDatBan.ngayDat,
        gioDat: savedThongTinDatBan.gioDat,
        trangThai: savedThongTinDatBan.trangThai,
        message: 'Có đơn đặt bàn mới',
        createdAt: new Date()
      };
      
      console.log('SOCKET: Chuẩn bị gửi thông báo đặt bàn mới:', notificationData);
      console.log('SOCKET: Các kết nối hiện tại:', Object.keys(io.sockets.sockets).length);
      
      // Gửi đến phòng nhà hàng cụ thể
      io.to(`restaurant_${savedThongTinDatBan.nhaHang}`).emit('new_reservation', notificationData);
      console.log(`SOCKET: Đã gửi thông báo đến phòng restaurant_${savedThongTinDatBan.nhaHang}`);
      
      // Gửi đến phòng admin
      io.to('admin_room').emit('new_reservation', notificationData);
      console.log('SOCKET: Đã gửi thông báo đến phòng admin_room');
      
      // Gửi broadcast toàn bộ 
      io.emit('new_reservation', notificationData);
      console.log('SOCKET: Đã gửi broadcast thông báo đến tất cả kết nối');
    } else {
      console.error('SOCKET: Không tìm thấy io, không thể gửi thông báo');
    }

    res.status(201).json({
      success: true,
      message: 'Đặt bàn thành công',
      data: savedThongTinDatBan
    });
  } catch (error) {
    // Log chi tiết lỗi
    console.error("Chi tiết lỗi đặt bàn:", error);
    logger.error(`Lỗi tạo đặt bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo đặt bàn: ' + error.message,
      error: error.message
    });
  }
};

// Cập nhật trạng thái đặt bàn
exports.updateTrangThaiDatBan = async (req, res) => {
  try {
    console.log("Received request to update status:", req.params.id, req.body);
    console.log("User info:", req.user);
    
    const { trangThai } = req.body;
    
    if (!trangThai || !['Chờ xác nhận', 'Đã xác nhận', 'Đã hủy', 'Hoàn thành'].includes(trangThai)) {
      console.log("Invalid status:", trangThai);
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }
    
    // Tìm thông tin đặt bàn cần cập nhật, bỏ populate để tránh lỗi
    const thongTinDatBan = await ThongTinDatBan.findById(req.params.id)
      .select('trangThai nhaHang ban nguoiDat');
    
    if (!thongTinDatBan) {
      console.log("Reservation not found:", req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }
    
    // Cho phép quản lý hoặc người dùng đổi trạng thái
    console.log("Current status:", thongTinDatBan.trangThai);
    console.log("New status:", trangThai);
    
    // Cập nhật trạng thái
    thongTinDatBan.trangThai = trangThai;
    const result = await thongTinDatBan.save();
    console.log("Update result:", result);
    
    // Lấy đối tượng io từ app
    const io = req.app.get('io');
    
    // Gửi thông báo qua Socket.IO
    if (io) {
      // Tạo dữ liệu thông báo
      const notificationData = {
        id: thongTinDatBan._id,
        trangThai: trangThai,
        message: `Đơn đặt bàn đã được cập nhật thành: ${trangThai}`,
        updatedAt: new Date()
      };
      
      // Gửi thông báo đến phòng quản lý/nhân viên nhà hàng
      io.to(`restaurant_${thongTinDatBan.nhaHang}`).emit('reservation_updated', notificationData);
      
      // Gửi thông báo đến phòng admin
      io.to('admin_room').emit('reservation_updated', notificationData);
      
      // Gửi thông báo đến người dùng cụ thể nếu có
      if (thongTinDatBan.nguoiDat) {
        io.to(`user_${thongTinDatBan.nguoiDat}`).emit('reservation_status_changed', {
          id: thongTinDatBan._id,
          trangThai: trangThai,
          message: `Đơn đặt bàn của bạn đã được cập nhật thành: ${trangThai}`,
          updatedAt: new Date()
        });
      }
      
      console.log("Socket notification sent");
    } else {
      console.log("Socket.IO not initialized");
    }
    
    // Gửi thông báo thành công
    console.log("Status updated successfully");
    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đặt bàn thành '${trangThai}' thành công`,
      data: thongTinDatBan
    });
  } catch (error) {
    console.error("Error updating reservation status:", error);
    logger.error(`Lỗi cập nhật trạng thái đặt bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái đặt bàn',
      error: error.message
    });
  }
};

// Cập nhật thông tin đặt bàn
exports.updateThongTinDatBan = async (req, res) => {
  try {
    const {
      hoTen,
      soDienThoai,
      email,
      ngayDat,
      gioDat,
      soLuongKhach,
      ghiChu,
      monAnDat,
      ban
    } = req.body;

    const thongTinDatBan = await ThongTinDatBan.findById(req.params.id);
    
    if (!thongTinDatBan) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }

    // Kiểm tra quyền - chỉ admin hoặc chủ đơn có thể cập nhật
    if (req.user.role === 'user') {
      if (!thongTinDatBan.nguoiDat || thongTinDatBan.nguoiDat.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật đơn đặt bàn này'
        });
      }
      
      if (thongTinDatBan.trangThai !== 'Chờ xác nhận') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể cập nhật đơn chờ xác nhận'
        });
      }
    }

    // Cập nhật thông tin
    if (hoTen) thongTinDatBan.hoTen = hoTen;
    if (soDienThoai) thongTinDatBan.soDienThoai = soDienThoai;
    if (email) thongTinDatBan.email = email;
    if (ngayDat) thongTinDatBan.ngayDat = ngayDat;
    if (gioDat) thongTinDatBan.gioDat = gioDat;
    if (soLuongKhach) thongTinDatBan.soLuongKhach = soLuongKhach;
    if (ghiChu !== undefined) thongTinDatBan.ghiChu = ghiChu;
    
    // Cập nhật bàn
    const oldBan = thongTinDatBan.ban;
    if (ban !== undefined) {
      thongTinDatBan.ban = ban;
    }
    
    // Cập nhật món ăn đặt
    if (monAnDat && monAnDat.length > 0) {
      thongTinDatBan.monAnDat = monAnDat;
      
      // Tính lại tổng tiền
      let tongTien = 0;
      monAnDat.forEach(item => {
        tongTien += item.gia * item.soLuong;
      });
      thongTinDatBan.tongTien = tongTien;
    }

    const updatedThongTinDatBan = await thongTinDatBan.save();

    // Cập nhật trạng thái bàn nếu có thay đổi bàn
    if (oldBan && oldBan.toString() !== ban && oldBan.toString() !== 'null' && oldBan.toString() !== 'undefined') {
      try {
        // Trả lại trạng thái "Có sẵn" cho bàn cũ
        await axios.put(`${config.serviceUrls.restaurant}/api/ban/${oldBan}`, {
          trangThai: 'Có sẵn'
        }, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
      } catch (error) {
        logger.error(`Lỗi cập nhật trạng thái bàn cũ: ${error.message}`);
      }
    }

    // Cập nhật trạng thái cho bàn mới nếu có
    if (ban && ban !== oldBan && ban !== 'null' && ban !== 'undefined') {
      try {
        await axios.put(`${config.serviceUrls.restaurant}/api/ban/${ban}`, {
          trangThai: updatedThongTinDatBan.trangThai === 'Đã xác nhận' ? 'Đang sử dụng' : 'Có sẵn'
        }, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
      } catch (error) {
        logger.error(`Lỗi cập nhật trạng thái bàn mới: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật đặt bàn thành công',
      data: updatedThongTinDatBan
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật thông tin đặt bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thông tin đặt bàn',
      error: error.message
    });
  }
};

// Xóa đặt bàn (chỉ admin)
exports.deleteThongTinDatBan = async (req, res) => {
  try {
    const thongTinDatBan = await ThongTinDatBan.findById(req.params.id);
    
    if (!thongTinDatBan) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }

    // Cập nhật trạng thái bàn thành "Có sẵn" nếu có bàn
    if (thongTinDatBan.ban) {
      try {
        await axios.put(`${config.serviceUrls.restaurant}/api/ban/${thongTinDatBan.ban}`, {
          trangThai: 'Có sẵn'
        }, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
      } catch (error) {
        logger.error(`Lỗi cập nhật trạng thái bàn khi xóa: ${error.message}`);
      }
    }

    await ThongTinDatBan.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Xóa thông tin đặt bàn thành công'
    });
  } catch (error) {
    logger.error(`Lỗi xóa thông tin đặt bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa thông tin đặt bàn',
      error: error.message
    });
  }
};

// Đếm số lượng đơn đặt bàn
exports.countThongTinDatBan = async (req, res) => {
  try {
    const filter = {};
    
    // Lọc theo trạng thái nếu có
    if (req.query.trangThai && ['Chờ xác nhận', 'Đã xác nhận', 'Đã hủy', 'Hoàn thành'].includes(req.query.trangThai)) {
      filter.trangThai = req.query.trangThai;
    }
    
    // Lọc theo nhà hàng nếu có
    if (req.query.nhaHang) {
      filter.nhaHang = req.query.nhaHang;
    }
    
    // Lọc theo ngày nếu có
    if (req.query.ngayDat) {
      const startDate = new Date(req.query.ngayDat);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.ngayDat);
      endDate.setHours(23, 59, 59, 999);
      
      filter.ngayDat = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    const count = await ThongTinDatBan.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    logger.error(`Lỗi đếm số lượng đặt bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi đếm số lượng đặt bàn',
      error: error.message
    });
  }
};

// Tính tổng doanh thu
exports.getTotalRevenue = async (req, res) => {
  try {
    const filter = {
      trangThai: { $in: ['Đã xác nhận', 'Hoàn thành'] }
    };
    
    // Lọc theo nhà hàng nếu có
    if (req.query.nhaHang) {
      filter.nhaHang = req.query.nhaHang;
    }
    
    // Lọc theo khoảng thời gian nếu có
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      filter.ngayDat = {
        $gte: startDate,
        $lte: endDate
      };
    } else if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      filter.ngayDat = {
        $gte: startDate
      };
    } else if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      filter.ngayDat = {
        $lte: endDate
      };
    }
    
    // Tính tổng doanh thu
    const result = await ThongTinDatBan.aggregate([
      { $match: filter },
      { $group: { _id: null, totalRevenue: { $sum: '$tongTien' } } }
    ]);
    
    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
    
    res.status(200).json({
      success: true,
      totalRevenue
    });
  } catch (error) {
    logger.error(`Lỗi tính tổng doanh thu: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tính tổng doanh thu',
      error: error.message
    });
  }
};

// Lấy danh sách đặt bàn gần đây
exports.getRecentThongTinDatBan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort === 'ngayDat' ? { ngayDat: -1 } : { createdAt: -1 };
    
    // Thay đổi cách lấy dữ liệu để tránh lỗi Schema hasn't been registered
    const recentDatBans = await ThongTinDatBan.find()
      .select('hoTen soDienThoai ngayDat gioDat soLuongKhach trangThai tongTien createdAt')
      .limit(limit)
      .sort(sort);
    
    res.status(200).json({
      success: true,
      data: recentDatBans
    });
  } catch (error) {
    logger.error(`Lỗi lấy danh sách đặt bàn gần đây: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách đặt bàn gần đây',
      error: error.message
    });
  }
}; 