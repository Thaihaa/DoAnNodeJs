const DanhGia = require('../models/DanhGia');
const MonAn = require('../../../services/menu/models/MonAn');
const NhaHang = require('../../../services/restaurant/models/NhaHang');
const logger = require('../../../utils/logger');

// Lấy danh sách đánh giá với phân trang
exports.getAllDanhGia = async (req, res) => {
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
    
    // Lọc theo món ăn
    if (req.query.monAn) {
      filter.monAn = req.query.monAn;
    }
    
    // Lọc theo điểm đánh giá
    if (req.query.diem) {
      filter.diem = parseInt(req.query.diem);
    }
    
    // Lọc theo người đánh giá
    if (req.query.nguoiDanhGia) {
      filter.nguoiDanhGia = req.query.nguoiDanhGia;
    }
    
    // Lọc theo trạng thái
    if (req.query.trangThai === 'true' || req.query.trangThai === 'false') {
      filter.trangThai = req.query.trangThai === 'true';
    }
    
    // Lọc theo xác thực
    if (req.query.daXacThuc === 'true' || req.query.daXacThuc === 'false') {
      filter.daXacThuc = req.query.daXacThuc === 'true';
    }

    // Thực hiện truy vấn
    const danhGias = await DanhGia.find(filter)
      .populate('nguoiDanhGia', 'username fullName avatar')
      .populate('nhaHang', 'tenNhaHang')
      .populate('monAn', 'tenMon')
      .populate({
        path: 'traLoi.nguoiTraLoi',
        select: 'username fullName avatar role'
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalDanhGia = await DanhGia.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: danhGias,
      page,
      totalPages: Math.ceil(totalDanhGia / limit),
      totalItems: totalDanhGia
    });
  } catch (error) {
    logger.error(`Lỗi lấy danh sách đánh giá: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách đánh giá',
      error: error.message
    });
  }
};

// Lấy chi tiết đánh giá
exports.getDanhGiaById = async (req, res) => {
  try {
    const danhGia = await DanhGia.findById(req.params.id)
      .populate('nguoiDanhGia', 'username fullName avatar')
      .populate('nhaHang', 'tenNhaHang')
      .populate('monAn', 'tenMon hinhAnh')
      .populate({
        path: 'traLoi.nguoiTraLoi',
        select: 'username fullName avatar role'
      });
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    res.status(200).json({
      success: true,
      data: danhGia
    });
  } catch (error) {
    logger.error(`Lỗi lấy chi tiết đánh giá: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết đánh giá',
      error: error.message
    });
  }
};

// Tạo đánh giá mới
exports.createDanhGia = async (req, res) => {
  try {
    const { nhaHang, monAn, diem, noiDung, hinhAnh } = req.body;
    const nguoiDanhGia = req.user.id;

    // Kiểm tra nếu đã đánh giá nhà hàng hoặc món ăn
    const existingDanhGia = await DanhGia.findOne({
      nguoiDanhGia,
      $or: [
        { nhaHang, monAn: null },
        { monAn, nhaHang }
      ]
    });

    if (existingDanhGia) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá nhà hàng hoặc món ăn này rồi'
      });
    }

    // Tạo đánh giá
    const danhGia = await DanhGia.create({
      nguoiDanhGia,
      nhaHang,
      monAn,
      diem,
      noiDung,
      hinhAnh
    });

    // Cập nhật điểm đánh giá cho nhà hàng
    if (nhaHang) {
      const nhaHangDoc = await NhaHang.findById(nhaHang);
      if (nhaHangDoc) {
        const allDanhGia = await DanhGia.find({ nhaHang });
        
        const totalDiem = allDanhGia.reduce((sum, item) => sum + item.diem, 0);
        const danhGiaTrungBinh = totalDiem / allDanhGia.length;
        
        nhaHangDoc.danhGiaTrungBinh = parseFloat(danhGiaTrungBinh.toFixed(1));
        nhaHangDoc.soLuongDanhGia = allDanhGia.length;
        await nhaHangDoc.save();
      }
    }

    // Cập nhật điểm đánh giá cho món ăn
    if (monAn) {
      const monAnDoc = await MonAn.findById(monAn);
      if (monAnDoc) {
        const allDanhGia = await DanhGia.find({ monAn });
        
        const totalDiem = allDanhGia.reduce((sum, item) => sum + item.diem, 0);
        const danhGiaTrungBinh = totalDiem / allDanhGia.length;
        
        monAnDoc.danhGiaTrungBinh = parseFloat(danhGiaTrungBinh.toFixed(1));
        monAnDoc.soLuongDanhGia = allDanhGia.length;
        await monAnDoc.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Đánh giá thành công',
      data: danhGia
    });
  } catch (error) {
    logger.error(`Lỗi tạo đánh giá: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo đánh giá',
      error: error.message
    });
  }
};

// Cập nhật đánh giá
exports.updateDanhGia = async (req, res) => {
  try {
    const { diem, noiDung, hinhAnh } = req.body;

    const danhGia = await DanhGia.findById(req.params.id);
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Kiểm tra quyền - chỉ người đánh giá mới có thể cập nhật
    if (danhGia.nguoiDanhGia.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đánh giá này'
      });
    }

    // Cập nhật thông tin
    if (diem) danhGia.diem = diem;
    if (noiDung) danhGia.noiDung = noiDung;
    if (hinhAnh) danhGia.hinhAnh = hinhAnh;

    const updatedDanhGia = await danhGia.save();

    // Cập nhật lại điểm đánh giá trung bình
    if (danhGia.nhaHang) {
      const nhaHangDoc = await NhaHang.findById(danhGia.nhaHang);
      if (nhaHangDoc) {
        const allDanhGia = await DanhGia.find({ nhaHang: danhGia.nhaHang });
        
        const totalDiem = allDanhGia.reduce((sum, item) => sum + item.diem, 0);
        const danhGiaTrungBinh = totalDiem / allDanhGia.length;
        
        nhaHangDoc.danhGiaTrungBinh = parseFloat(danhGiaTrungBinh.toFixed(1));
        await nhaHangDoc.save();
      }
    }

    if (danhGia.monAn) {
      const monAnDoc = await MonAn.findById(danhGia.monAn);
      if (monAnDoc) {
        const allDanhGia = await DanhGia.find({ monAn: danhGia.monAn });
        
        const totalDiem = allDanhGia.reduce((sum, item) => sum + item.diem, 0);
        const danhGiaTrungBinh = totalDiem / allDanhGia.length;
        
        monAnDoc.danhGiaTrungBinh = parseFloat(danhGiaTrungBinh.toFixed(1));
        await monAnDoc.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật đánh giá thành công',
      data: updatedDanhGia
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật đánh giá: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật đánh giá',
      error: error.message
    });
  }
};

// Trả lời đánh giá
exports.themTraLoiDanhGia = async (req, res) => {
  try {
    const { noiDung } = req.body;
    const nguoiTraLoi = req.user.id;

    if (!noiDung) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung trả lời không được để trống'
      });
    }

    const danhGia = await DanhGia.findById(req.params.id);
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Thêm trả lời
    danhGia.traLoi.push({
      nguoiTraLoi,
      noiDung,
      createdAt: new Date()
    });

    const updatedDanhGia = await danhGia.save();

    // Populate để trả về thông tin người trả lời
    const populatedDanhGia = await DanhGia.findById(updatedDanhGia._id)
      .populate('nguoiDanhGia', 'username fullName avatar')
      .populate({
        path: 'traLoi.nguoiTraLoi',
        select: 'username fullName avatar role'
      });

    res.status(200).json({
      success: true,
      message: 'Trả lời đánh giá thành công',
      data: populatedDanhGia
    });
  } catch (error) {
    logger.error(`Lỗi trả lời đánh giá: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi trả lời đánh giá',
      error: error.message
    });
  }
};

// Xóa đánh giá (người dùng hoặc admin)
exports.deleteDanhGia = async (req, res) => {
  try {
    const danhGia = await DanhGia.findById(req.params.id);
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Kiểm tra quyền - người đánh giá hoặc admin có thể xóa
    if (danhGia.nguoiDanhGia.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa đánh giá này'
      });
    }

    // Lưu thông tin để cập nhật điểm trung bình sau khi xóa
    const { nhaHang, monAn } = danhGia;

    await DanhGia.findByIdAndDelete(req.params.id);

    // Cập nhật lại điểm đánh giá trung bình cho nhà hàng
    if (nhaHang) {
      const nhaHangDoc = await NhaHang.findById(nhaHang);
      if (nhaHangDoc) {
        const allDanhGia = await DanhGia.find({ nhaHang });
        
        if (allDanhGia.length > 0) {
          const totalDiem = allDanhGia.reduce((sum, item) => sum + item.diem, 0);
          const danhGiaTrungBinh = totalDiem / allDanhGia.length;
          
          nhaHangDoc.danhGiaTrungBinh = parseFloat(danhGiaTrungBinh.toFixed(1));
        } else {
          nhaHangDoc.danhGiaTrungBinh = 0;
        }
        
        nhaHangDoc.soLuongDanhGia = allDanhGia.length;
        await nhaHangDoc.save();
      }
    }

    // Cập nhật lại điểm đánh giá trung bình cho món ăn
    if (monAn) {
      const monAnDoc = await MonAn.findById(monAn);
      if (monAnDoc) {
        const allDanhGia = await DanhGia.find({ monAn });
        
        if (allDanhGia.length > 0) {
          const totalDiem = allDanhGia.reduce((sum, item) => sum + item.diem, 0);
          const danhGiaTrungBinh = totalDiem / allDanhGia.length;
          
          monAnDoc.danhGiaTrungBinh = parseFloat(danhGiaTrungBinh.toFixed(1));
        } else {
          monAnDoc.danhGiaTrungBinh = 0;
        }
        
        monAnDoc.soLuongDanhGia = allDanhGia.length;
        await monAnDoc.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    logger.error(`Lỗi xóa đánh giá: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa đánh giá',
      error: error.message
    });
  }
};

// Cập nhật trạng thái đánh giá (ẩn/hiện - chỉ admin)
exports.updateTrangThaiDanhGia = async (req, res) => {
  try {
    const { trangThai } = req.body;

    if (trangThai === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không được cung cấp'
      });
    }

    const danhGia = await DanhGia.findById(req.params.id);
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    danhGia.trangThai = trangThai;
    const updatedDanhGia = await danhGia.save();

    res.status(200).json({
      success: true,
      message: `Đánh giá đã được ${trangThai ? 'hiện' : 'ẩn'}`,
      data: updatedDanhGia
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật trạng thái đánh giá: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái đánh giá',
      error: error.message
    });
  }
};

// Xác thực đánh giá (chỉ admin)
exports.xacThucDanhGia = async (req, res) => {
  try {
    const { daXacThuc } = req.body;

    if (daXacThuc === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái xác thực không được cung cấp'
      });
    }

    const danhGia = await DanhGia.findById(req.params.id);
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    danhGia.daXacThuc = daXacThuc;
    const updatedDanhGia = await danhGia.save();

    res.status(200).json({
      success: true,
      message: `Đánh giá đã được ${daXacThuc ? 'xác thực' : 'bỏ xác thực'}`,
      data: updatedDanhGia
    });
  } catch (error) {
    logger.error(`Lỗi xác thực đánh giá: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực đánh giá',
      error: error.message
    });
  }
}; 