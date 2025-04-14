const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema(
  {
    nguoiDanhGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người đánh giá là bắt buộc']
    },
    nhaHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhaHang',
      required: [true, 'Nhà hàng là bắt buộc']
    },
    monAn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonAn'
    },
    diem: {
      type: Number,
      required: [true, 'Điểm đánh giá là bắt buộc'],
      min: 1,
      max: 5
    },
    noiDung: {
      type: String,
      required: [true, 'Nội dung đánh giá là bắt buộc'],
      trim: true
    },
    hinhAnh: {
      type: [String],
      default: []
    },
    traLoi: [
      {
        nguoiTraLoi: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        noiDung: {
          type: String,
          required: true,
          trim: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    daXacThuc: {
      type: Boolean,
      default: false
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

// Thiết lập index tìm kiếm
danhGiaSchema.index({ nhaHang: 1, nguoiDanhGia: 1 });
danhGiaSchema.index({ monAn: 1, nguoiDanhGia: 1 });

const DanhGia = mongoose.model('DanhGia', danhGiaSchema);

module.exports = DanhGia; 