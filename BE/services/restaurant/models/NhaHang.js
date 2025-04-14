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
      required: [true, 'Địa chỉ nhà hàng là bắt buộc']
    },
    dienThoai: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    },
    gioMoCua: {
      type: String,
      required: [true, 'Giờ mở cửa là bắt buộc']
    },
    gioDongCua: {
      type: String,
      required: [true, 'Giờ đóng cửa là bắt buộc']
    },
    moTa: {
      type: String
    },
    hinhAnh: {
      type: [String],
      default: []
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
    trangThai: {
      type: String,
      enum: ['Đang hoạt động', 'Tạm ngưng', 'Đóng cửa'],
      default: 'Đang hoạt động'
    },
    viTri: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0] // [longitude, latitude]
      }
    }
  },
  {
    timestamps: true
  }
);

// Tạo index cho vị trí để tìm kiếm theo khoảng cách
nhaHangSchema.index({ viTri: '2dsphere' });

const NhaHang = mongoose.model('NhaHang', nhaHangSchema);

module.exports = NhaHang; 