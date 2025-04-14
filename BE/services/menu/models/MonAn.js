const mongoose = require('mongoose');

const monAnSchema = new mongoose.Schema(
  {
    tenMon: {
      type: String,
      required: [true, 'Tên món ăn là bắt buộc'],
      trim: true
    },
    moTa: {
      type: String,
      trim: true
    },
    gia: {
      type: Number,
      required: [true, 'Giá món ăn là bắt buộc'],
      min: 0
    },
    giaKhuyenMai: {
      type: Number,
      default: 0,
      min: 0
    },
    hinhAnh: {
      type: [String],
      default: []
    },
    nguyenLieu: {
      type: String
    },
    loaiMonAn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoaiMonAn',
      required: [true, 'Loại món ăn là bắt buộc']
    },
    nhaHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhaHang',
      required: [true, 'Nhà hàng là bắt buộc']
    },
    trangThai: {
      type: Boolean,
      default: true
    },
    noiBat: {
      type: Boolean,
      default: false
    },
    danhGiaTrungBinh: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    soLuongDanhGia: {
      type: Number,
      default: 0
    },
    thuTu: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Tạo index tìm kiếm theo tên
monAnSchema.index({ tenMon: 'text', moTa: 'text' });

const MonAn = mongoose.model('MonAn', monAnSchema);

module.exports = MonAn; 