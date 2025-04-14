const LoaiMonAn = require('../models/LoaiMonAn');
const logger = require('../../../utils/logger');

// Lấy tất cả loại món ăn
exports.getAllLoaiMonAn = async (req, res) => {
  try {
    const trangThai = req.query.trangThai === 'true' ? true : 
                     req.query.trangThai === 'false' ? false : undefined;
    
    const filter = {};
    if (trangThai !== undefined) {
      filter.trangThai = trangThai;
    }

    const loaiMonAns = await LoaiMonAn.find(filter).sort({ thuTu: 1 });

    res.status(200).json({
      success: true,
      count: loaiMonAns.length,
      data: loaiMonAns
    });
  } catch (error) {
    logger.error(`Lỗi lấy danh sách loại món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách loại món ăn',
      error: error.message
    });
  }
};

// Lấy chi tiết loại món ăn
exports.getLoaiMonAnById = async (req, res) => {
  try {
    const loaiMonAn = await LoaiMonAn.findById(req.params.id);
    
    if (!loaiMonAn) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy loại món ăn'
      });
    }

    res.status(200).json({
      success: true,
      data: loaiMonAn
    });
  } catch (error) {
    logger.error(`Lỗi lấy chi tiết loại món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết loại món ăn',
      error: error.message
    });
  }
};

// Tạo loại món ăn mới
exports.createLoaiMonAn = async (req, res) => {
  try {
    const { tenLoai, moTa, hinhAnh, thuTu, trangThai } = req.body;

    // Kiểm tra tên loại món ăn đã tồn tại chưa
    const existingLoaiMonAn = await LoaiMonAn.findOne({ tenLoai });
    if (existingLoaiMonAn) {
      return res.status(400).json({
        success: false,
        message: 'Tên loại món ăn đã tồn tại'
      });
    }

    const loaiMonAn = await LoaiMonAn.create({
      tenLoai,
      moTa,
      hinhAnh,
      thuTu: thuTu || 0,
      trangThai: trangThai !== undefined ? trangThai : true
    });

    res.status(201).json({
      success: true,
      message: 'Tạo loại món ăn thành công',
      data: loaiMonAn
    });
  } catch (error) {
    logger.error(`Lỗi tạo loại món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo loại món ăn',
      error: error.message
    });
  }
};

// Cập nhật loại món ăn
exports.updateLoaiMonAn = async (req, res) => {
  try {
    const { tenLoai, moTa, hinhAnh, thuTu, trangThai } = req.body;

    const loaiMonAn = await LoaiMonAn.findById(req.params.id);
    
    if (!loaiMonAn) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy loại món ăn'
      });
    }

    // Kiểm tra tên loại đã tồn tại chưa (trừ chính nó)
    if (tenLoai && tenLoai !== loaiMonAn.tenLoai) {
      const existingLoaiMonAn = await LoaiMonAn.findOne({ tenLoai });
      if (existingLoaiMonAn) {
        return res.status(400).json({
          success: false,
          message: 'Tên loại món ăn đã tồn tại'
        });
      }
    }

    // Cập nhật thông tin
    if (tenLoai) loaiMonAn.tenLoai = tenLoai;
    if (moTa !== undefined) loaiMonAn.moTa = moTa;
    if (hinhAnh) loaiMonAn.hinhAnh = hinhAnh;
    if (thuTu !== undefined) loaiMonAn.thuTu = thuTu;
    if (trangThai !== undefined) loaiMonAn.trangThai = trangThai;

    const updatedLoaiMonAn = await loaiMonAn.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật loại món ăn thành công',
      data: updatedLoaiMonAn
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật loại món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật loại món ăn',
      error: error.message
    });
  }
};

// Xóa loại món ăn
exports.deleteLoaiMonAn = async (req, res) => {
  try {
    const loaiMonAn = await LoaiMonAn.findById(req.params.id);
    
    if (!loaiMonAn) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy loại món ăn'
      });
    }

    await loaiMonAn.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa loại món ăn thành công'
    });
  } catch (error) {
    logger.error(`Lỗi xóa loại món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa loại món ăn',
      error: error.message
    });
  }
};

// Xóa tất cả loại món ăn (Chỉ admin)
exports.deleteAllLoaiMonAn = async (req, res) => {
  try {
    // Xóa tất cả loại món ăn
    const result = await LoaiMonAn.deleteMany({});

    res.status(200).json({
      success: true,
      message: `Đã xóa tất cả loại món ăn (${result.deletedCount} loại)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error(`Lỗi xóa tất cả loại món ăn: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa tất cả loại món ăn',
      error: error.message
    });
  }
}; 