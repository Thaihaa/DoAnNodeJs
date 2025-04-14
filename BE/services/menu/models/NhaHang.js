const mongoose = require('mongoose');

const nhaHangSchema = new mongoose.Schema(
  {
    tenNhaHang: {
      type: String,
      required: [true, 'Tên nhà hàng là bắt buộc'],
      trim: true
    },
    diaChi: {
      type: String,
      trim: true
    },
    dienThoai: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    moTa: {
      type: String,
      trim: true
    },
    hinhAnh: {
      type: [String],
      default: []
    },
    gioMoCua: {
      type: String
    },
    gioDongCua: {
      type: String
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

// Tạo model từ schema
const NhaHang = mongoose.model('NhaHang', nhaHangSchema);

module.exports = NhaHang; 