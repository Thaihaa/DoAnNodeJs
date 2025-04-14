const mongoose = require('mongoose');

const loaiMonAnSchema = new mongoose.Schema(
  {
    tenLoai: {
      type: String,
      required: [true, 'Tên loại món ăn là bắt buộc'],
      trim: true,
      unique: true
    },
    moTa: {
      type: String,
      trim: true
    },
    hinhAnh: {
      type: String
    },
    thuTu: {
      type: Number,
      default: 0
    },
    trangThai: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const LoaiMonAn = mongoose.model('LoaiMonAn', loaiMonAnSchema);

module.exports = LoaiMonAn; 