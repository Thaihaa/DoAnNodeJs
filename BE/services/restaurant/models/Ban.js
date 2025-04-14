const mongoose = require('mongoose');

const banSchema = new mongoose.Schema(
  {
    maBan: {
      type: String,
      required: [true, 'Mã bàn là bắt buộc'],
      trim: true
    },
    nhaHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhaHang',
      required: [true, 'Nhà hàng là bắt buộc']
    },
    viTri: {
      type: String,
      required: [true, 'Vị trí bàn là bắt buộc'],
      trim: true
    },
    soLuongKhachToiDa: {
      type: Number,
      required: [true, 'Số lượng khách tối đa là bắt buộc'],
      min: 1
    },
    trangThai: {
      type: String,
      enum: ['Có sẵn', 'Đang sử dụng', 'Bảo trì'],
      default: 'Có sẵn'
    },
    moTa: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Tạo chỉ mục cho việc tìm kiếm
banSchema.index({ nhaHang: 1, maBan: 1 }, { unique: true });

const Ban = mongoose.model('Ban', banSchema);

module.exports = Ban; 