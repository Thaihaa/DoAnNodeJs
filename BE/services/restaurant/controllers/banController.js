const Ban = require('../models/Ban');
const logger = require('../../../utils/logger');
const { validationResult } = require('express-validator');

// Lấy danh sách bàn với phân trang
exports.getAllBan = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Tạo filter
    const filter = {};
    
    // Lọc theo nhà hàng
    if (req.query.nhaHang) {
      filter.nhaHang = req.query.nhaHang;
    }
    
    // Lọc theo trạng thái
    if (req.query.trangThai && ['Có sẵn', 'Đang sử dụng', 'Bảo trì'].includes(req.query.trangThai)) {
      filter.trangThai = req.query.trangThai;
    }
    
    // Lọc theo vị trí
    if (req.query.viTri) {
      filter.viTri = { $regex: req.query.viTri, $options: 'i' };
    }

    // Thực hiện truy vấn
    const bans = await Ban.find(filter)
      .populate('nhaHang', 'tenNhaHang diaChi')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalBan = await Ban.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bans,
      page,
      totalPages: Math.ceil(totalBan / limit),
      totalItems: totalBan
    });
  } catch (error) {
    logger.error(`Lỗi lấy danh sách bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách bàn',
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết một bàn
exports.getBanById = async (req, res) => {
  try {
    const ban = await Ban.findById(req.params.id)
      .populate('nhaHang', 'tenNhaHang diaChi dienThoai email');
    
    if (!ban) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bàn'
      });
    }

    res.status(200).json({
      success: true,
      data: ban
    });
  } catch (error) {
    logger.error(`Lỗi lấy thông tin bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin bàn',
      error: error.message
    });
  }
};

// Tạo bàn mới
exports.createBan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const {
      maBan,
      nhaHang,
      viTri,
      soLuongKhachToiDa,
      trangThai,
      moTa
    } = req.body;

    // Kiểm tra bàn đã tồn tại chưa
    const existingBan = await Ban.findOne({ nhaHang, maBan });
    if (existingBan) {
      return res.status(400).json({
        success: false,
        message: 'Mã bàn đã tồn tại trong nhà hàng này'
      });
    }

    const ban = await Ban.create({
      maBan,
      nhaHang,
      viTri,
      soLuongKhachToiDa,
      trangThai,
      moTa
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bàn mới thành công',
      data: ban
    });
  } catch (error) {
    logger.error(`Lỗi tạo bàn mới: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo bàn mới',
      error: error.message
    });
  }
};

// Cập nhật thông tin bàn
exports.updateBan = async (req, res) => {
  try {
    const {
      maBan,
      viTri,
      soLuongKhachToiDa,
      trangThai,
      moTa
    } = req.body;

    const ban = await Ban.findById(req.params.id);
    
    if (!ban) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bàn'
      });
    }

    // Kiểm tra nếu đổi mã bàn, không được trùng với bàn khác trong cùng nhà hàng
    if (maBan && maBan !== ban.maBan) {
      const existingBan = await Ban.findOne({ 
        nhaHang: ban.nhaHang, 
        maBan,
        _id: { $ne: req.params.id }
      });
      
      if (existingBan) {
        return res.status(400).json({
          success: false,
          message: 'Mã bàn đã tồn tại trong nhà hàng này'
        });
      }
      
      ban.maBan = maBan;
    }

    // Cập nhật thông tin
    if (viTri) ban.viTri = viTri;
    if (soLuongKhachToiDa) ban.soLuongKhachToiDa = soLuongKhachToiDa;
    if (trangThai && ['Có sẵn', 'Đang sử dụng', 'Bảo trì'].includes(trangThai)) {
      ban.trangThai = trangThai;
    }
    if (moTa !== undefined) ban.moTa = moTa;

    const updatedBan = await ban.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin bàn thành công',
      data: updatedBan
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật bàn',
      error: error.message
    });
  }
};

// Xóa bàn
exports.deleteBan = async (req, res) => {
  try {
    const ban = await Ban.findById(req.params.id);
    
    if (!ban) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bàn'
      });
    }

    await ban.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa bàn thành công'
    });
  } catch (error) {
    logger.error(`Lỗi xóa bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa bàn',
      error: error.message
    });
  }
};

// Kiểm tra tình trạng bàn có sẵn
exports.checkBanAvailability = async (req, res) => {
  try {
    const { nhaHang, ngayDat, gioDat, soLuongKhach } = req.query;
    
    if (!nhaHang || !ngayDat || !gioDat || !soLuongKhach) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin nhà hàng, ngày, giờ và số lượng khách'
      });
    }

    // Tìm tất cả các bàn có sẵn trong nhà hàng có thể đáp ứng số lượng khách
    const availableBans = await Ban.find({
      nhaHang,
      trangThai: 'Có sẵn',
      soLuongKhachToiDa: { $gte: parseInt(soLuongKhach) }
    }).sort({ soLuongKhachToiDa: 1 });

    res.status(200).json({
      success: true,
      data: {
        availableBans,
        count: availableBans.length
      }
    });
  } catch (error) {
    logger.error(`Lỗi kiểm tra tình trạng bàn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra tình trạng bàn',
      error: error.message
    });
  }
}; 