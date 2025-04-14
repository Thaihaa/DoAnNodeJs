const NhaHang = require('../models/NhaHang');
const logger = require('../../../utils/logger');

// Lấy danh sách nhà hàng với phân trang
exports.getAllNhaHang = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Tìm kiếm theo từ khóa
    const keyword = req.query.keyword
      ? {
          $or: [
            { tenNhaHang: { $regex: req.query.keyword, $options: 'i' } },
            { diaChi: { $regex: req.query.keyword, $options: 'i' } },
            { moTa: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};
      
    // Lọc theo trạng thái
    if (req.query.trangThai && ['Đang hoạt động', 'Tạm ngưng', 'Đóng cửa'].includes(req.query.trangThai)) {
      keyword.trangThai = req.query.trangThai;
    }

    // Thực hiện truy vấn
    const nhaHangs = await NhaHang.find(keyword)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalNhaHang = await NhaHang.countDocuments(keyword);

    res.status(200).json({
      success: true,
      data: nhaHangs,
      page,
      totalPages: Math.ceil(totalNhaHang / limit),
      totalItems: totalNhaHang
    });
  } catch (error) {
    logger.error(`Lỗi lấy danh sách nhà hàng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách nhà hàng',
      error: error.message
    });
  }
};

// Lấy chi tiết một nhà hàng
exports.getNhaHangById = async (req, res) => {
  try {
    const nhaHang = await NhaHang.findById(req.params.id);
    
    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà hàng'
      });
    }

    res.status(200).json({
      success: true,
      data: nhaHang
    });
  } catch (error) {
    logger.error(`Lỗi lấy chi tiết nhà hàng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết nhà hàng',
      error: error.message
    });
  }
};

// Tạo nhà hàng mới
exports.createNhaHang = async (req, res) => {
  try {
    const {
      tenNhaHang,
      diaChi,
      dienThoai,
      email,
      website,
      gioMoCua,
      gioDongCua,
      moTa,
      hinhAnh,
      viTri
    } = req.body;

    // Kiểm tra trùng tên nhà hàng
    const existingNhaHang = await NhaHang.findOne({ tenNhaHang });
    if (existingNhaHang) {
      return res.status(400).json({
        success: false,
        message: 'Tên nhà hàng đã tồn tại'
      });
    }

    const nhaHang = await NhaHang.create({
      tenNhaHang,
      diaChi,
      dienThoai,
      email,
      website,
      gioMoCua,
      gioDongCua,
      moTa,
      hinhAnh,
      viTri
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nhà hàng thành công',
      data: nhaHang
    });
  } catch (error) {
    logger.error(`Lỗi tạo nhà hàng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo nhà hàng',
      error: error.message
    });
  }
};

// Cập nhật thông tin nhà hàng
exports.updateNhaHang = async (req, res) => {
  try {
    const {
      tenNhaHang,
      diaChi,
      dienThoai,
      email,
      website,
      gioMoCua,
      gioDongCua,
      moTa,
      hinhAnh,
      viTri,
      trangThai
    } = req.body;

    const nhaHang = await NhaHang.findById(req.params.id);
    
    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà hàng'
      });
    }

    // Kiểm tra trùng tên nhà hàng (trừ chính nó)
    if (tenNhaHang && tenNhaHang !== nhaHang.tenNhaHang) {
      const existingNhaHang = await NhaHang.findOne({ tenNhaHang });
      if (existingNhaHang) {
        return res.status(400).json({
          success: false,
          message: 'Tên nhà hàng đã tồn tại'
        });
      }
    }

    // Cập nhật thông tin
    if (tenNhaHang) nhaHang.tenNhaHang = tenNhaHang;
    if (diaChi) nhaHang.diaChi = diaChi;
    if (dienThoai) nhaHang.dienThoai = dienThoai;
    if (email) nhaHang.email = email;
    if (website !== undefined) nhaHang.website = website;
    if (gioMoCua) nhaHang.gioMoCua = gioMoCua;
    if (gioDongCua) nhaHang.gioDongCua = gioDongCua;
    if (moTa !== undefined) nhaHang.moTa = moTa;
    if (hinhAnh) nhaHang.hinhAnh = hinhAnh;
    if (viTri) nhaHang.viTri = viTri;
    if (trangThai && ['Đang hoạt động', 'Tạm ngưng', 'Đóng cửa'].includes(trangThai)) {
      nhaHang.trangThai = trangThai;
    }

    const updatedNhaHang = await nhaHang.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật nhà hàng thành công',
      data: updatedNhaHang
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật nhà hàng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật nhà hàng',
      error: error.message
    });
  }
};

// Xóa nhà hàng
exports.deleteNhaHang = async (req, res) => {
  try {
    const nhaHang = await NhaHang.findById(req.params.id);
    
    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà hàng'
      });
    }

    await NhaHang.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Xóa nhà hàng thành công'
    });
  } catch (error) {
    logger.error(`Lỗi xóa nhà hàng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa nhà hàng',
      error: error.message
    });
  }
};

// Tìm nhà hàng gần đây
exports.getNhaHangGanDay = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tọa độ vị trí'
      });
    }

    // Chuyển đổi sang số
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const distance = parseInt(maxDistance) || 10000; // Mặc định 10km
    
    // Tìm nhà hàng trong phạm vi
    const nhaHangs = await NhaHang.find({
      viTri: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: distance
        }
      }
    }).limit(10);

    res.status(200).json({
      success: true,
      count: nhaHangs.length,
      data: nhaHangs
    });
  } catch (error) {
    logger.error(`Lỗi tìm nhà hàng gần đây: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tìm nhà hàng gần đây',
      error: error.message
    });
  }
};

// Đếm số lượng nhà hàng
exports.countNhaHang = async (req, res) => {
  try {
    const filter = {};
    
    // Lọc theo trạng thái nếu có
    if (req.query.trangThai && ['Đang hoạt động', 'Tạm ngưng', 'Đóng cửa'].includes(req.query.trangThai)) {
      filter.trangThai = req.query.trangThai;
    }
    
    const count = await NhaHang.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    logger.error(`Lỗi đếm số lượng nhà hàng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi đếm số lượng nhà hàng',
      error: error.message
    });
  }
}; 