const MonAn = require('../models/MonAn');
const LoaiMonAn = require('../models/LoaiMonAn');
const logger = require('../../../utils/logger');

// Lấy danh sách món ăn với phân trang và lọc
exports.getAllMonAn = async (req, res) => {
  try {
    console.log('Nhận request GET /mon-an với query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Tạo bộ lọc
    const filter = {};
    
    // Lọc theo loại món ăn
    if (req.query.loaiMonAn) {
      filter.loaiMonAn = req.query.loaiMonAn;
      console.log('Lọc theo loại món ăn:', req.query.loaiMonAn);
    }
    
    // Lọc theo nhà hàng
    if (req.query.nhaHang) {
      filter.nhaHang = req.query.nhaHang;
    }
    
    // Lọc theo trạng thái
    if (req.query.trangThai === 'true' || req.query.trangThai === 'false') {
      filter.trangThai = req.query.trangThai === 'true';
    }
    
    // Lọc món nổi bật
    if (req.query.noiBat === 'true' || req.query.noiBat === 'false') {
      filter.noiBat = req.query.noiBat === 'true';
    }
    
    // Tìm kiếm theo từ khóa
    if (req.query.keyword) {
      filter.$or = [
        { tenMon: { $regex: req.query.keyword, $options: 'i' } },
        { moTa: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    
    // Lọc theo khoảng giá
    if (req.query.giaMin || req.query.giaMax) {
      filter.gia = {};
      if (req.query.giaMin) filter.gia.$gte = parseInt(req.query.giaMin);
      if (req.query.giaMax) filter.gia.$lte = parseInt(req.query.giaMax);
    }

    console.log('Bộ lọc cuối cùng:', JSON.stringify(filter));

    // Thực hiện truy vấn - chỉ populate loaiMonAn để tránh lỗi với nhaHang
    const monAns = await MonAn.find(filter)
      .populate('loaiMonAn', 'tenLoai')
      .skip(skip)
      .limit(limit)
      .sort(req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder === 'desc' ? -1 : 1 } : { thuTu: 1, createdAt: -1 });

    console.log(`Tìm thấy ${monAns.length} món ăn`);
    
    const totalMonAn = await MonAn.countDocuments(filter);
    console.log(`Tổng số món ăn: ${totalMonAn}`);

    res.status(200).json({
      success: true,
      data: monAns,
      page,
      totalPages: Math.ceil(totalMonAn / limit),
      totalItems: totalMonAn
    });
  } catch (error) {
    console.error(`Lỗi lấy danh sách món ăn: ${error.message}`, error);
    logger.error(`Lỗi lấy danh sách món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách món ăn',
      error: error.message
    });
  }
};

// Lấy chi tiết món ăn
exports.getMonAnById = async (req, res) => {
  try {
    const monAn = await MonAn.findById(req.params.id)
      .populate('loaiMonAn', 'tenLoai')
      .populate('nhaHang', 'tenNhaHang diaChi dienThoai');
    
    if (!monAn) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn'
      });
    }

    res.status(200).json({
      success: true,
      data: monAn
    });
  } catch (error) {
    logger.error(`Lỗi lấy chi tiết món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết món ăn',
      error: error.message
    });
  }
};

// Tạo món ăn mới
exports.createMonAn = async (req, res) => {
  try {
    const {
      tenMon,
      moTa,
      gia,
      giaKhuyenMai,
      hinhAnh,
      nguyenLieu,
      loaiMonAn,
      nhaHang,
      trangThai,
      noiBat,
      thuTu
    } = req.body;

    // Kiểm tra loại món ăn tồn tại
    const existingLoaiMonAn = await LoaiMonAn.findById(loaiMonAn);
    if (!existingLoaiMonAn) {
      return res.status(400).json({
        success: false,
        message: 'Loại món ăn không tồn tại'
      });
    }

    // Tạo món ăn mới - với ID nhà hàng mặc định nếu không có
    const defaultNhaHangId = "65eec46bf3de78eab0e14ecb"; // ID nhà hàng mặc định
    
    const monAn = await MonAn.create({
      tenMon,
      moTa,
      gia,
      giaKhuyenMai: giaKhuyenMai || 0,
      hinhAnh,
      nguyenLieu,
      loaiMonAn,
      nhaHang: nhaHang || defaultNhaHangId, // Sử dụng ID mặc định nếu không có
      trangThai: trangThai !== undefined ? trangThai : true,
      noiBat: noiBat !== undefined ? noiBat : false,
      thuTu: thuTu || 0
    });

    res.status(201).json({
      success: true,
      message: 'Tạo món ăn thành công',
      data: monAn
    });
  } catch (error) {
    logger.error(`Lỗi tạo món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo món ăn',
      error: error.message
    });
  }
};

// Cập nhật món ăn
exports.updateMonAn = async (req, res) => {
  try {
    const {
      tenMon,
      moTa,
      gia,
      giaKhuyenMai,
      hinhAnh,
      nguyenLieu,
      loaiMonAn,
      nhaHang,
      trangThai,
      noiBat,
      thuTu
    } = req.body;

    const monAn = await MonAn.findById(req.params.id);
    
    if (!monAn) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn'
      });
    }

    // Kiểm tra loại món ăn tồn tại nếu có cập nhật loại
    if (loaiMonAn) {
      const existingLoaiMonAn = await LoaiMonAn.findById(loaiMonAn);
      if (!existingLoaiMonAn) {
        return res.status(400).json({
          success: false,
          message: 'Loại món ăn không tồn tại'
        });
      }
    }

    // Cập nhật thông tin
    if (tenMon) monAn.tenMon = tenMon;
    if (moTa !== undefined) monAn.moTa = moTa;
    if (gia !== undefined) monAn.gia = gia;
    if (giaKhuyenMai !== undefined) monAn.giaKhuyenMai = giaKhuyenMai;
    if (hinhAnh) monAn.hinhAnh = hinhAnh;
    if (nguyenLieu !== undefined) monAn.nguyenLieu = nguyenLieu;
    if (loaiMonAn) monAn.loaiMonAn = loaiMonAn;
    if (nhaHang) monAn.nhaHang = nhaHang;
    if (trangThai !== undefined) monAn.trangThai = trangThai;
    if (noiBat !== undefined) monAn.noiBat = noiBat;
    if (thuTu !== undefined) monAn.thuTu = thuTu;

    const updatedMonAn = await monAn.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật món ăn thành công',
      data: updatedMonAn
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật món ăn',
      error: error.message
    });
  }
};

// Xóa món ăn
exports.deleteMonAn = async (req, res) => {
  try {
    const monAn = await MonAn.findById(req.params.id);
    
    if (!monAn) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn'
      });
    }

    await MonAn.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Xóa món ăn thành công'
    });
  } catch (error) {
    logger.error(`Lỗi xóa món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa món ăn',
      error: error.message
    });
  }
};

// Xóa tất cả món ăn (Chỉ admin)
exports.deleteAllMonAn = async (req, res) => {
  try {
    // Xóa tất cả món ăn
    const result = await MonAn.deleteMany({});

    res.status(200).json({
      success: true,
      message: `Đã xóa tất cả món ăn (${result.deletedCount} món)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error(`Lỗi xóa tất cả món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa tất cả món ăn',
      error: error.message
    });
  }
};

// Lấy danh sách món ăn nổi bật
exports.getMonAnNoiBat = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Lọc theo nhà hàng nếu có
    const filter = { noiBat: true };
    if (req.query.nhaHang) {
      filter.nhaHang = req.query.nhaHang;
    }
    
    // Lấy món ăn nổi bật
    const monAns = await MonAn.find(filter)
      .populate('loaiMonAn', 'tenLoai')
      .limit(limit)
      .sort({ thuTu: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: monAns
    });
  } catch (error) {
    logger.error(`Lỗi lấy món ăn nổi bật: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy món ăn nổi bật',
      error: error.message
    });
  }
};

// Lấy món ăn phổ biến
exports.getPopularMonAn = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Tạo dữ liệu mẫu (do chưa có dữ liệu thực về số lần đặt mỗi món)
    const popularMonAn = await MonAn.aggregate([
      { $match: { trangThai: true } },
      // Giả lập số lần đặt món này (trong thực tế sẽ join với bảng đơn hàng)
      { $project: {
          tenMon: 1,
          count: { $floor: { $multiply: [{ $rand: {} }, 50] } } // Random số từ 0-50
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    
    res.status(200).json({
      success: true,
      data: popularMonAn
    });
  } catch (error) {
    logger.error(`Lỗi lấy món ăn phổ biến: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy món ăn phổ biến',
      error: error.message
    });
  }
}; 