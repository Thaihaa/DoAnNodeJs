const mongoose = require('mongoose');
const logger = require('../../../utils/logger');

const thongTinDatBanSchema = new mongoose.Schema(
  {
    nguoiDat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hoTen: {
      type: String,
      required: [true, 'Họ tên người đặt là bắt buộc'],
      trim: true
    },
    soDienThoai: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    nhaHang: {
      type: String,
      required: [true, 'Nhà hàng là bắt buộc']
    },
    ban: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ban'
    },
    ngayDat: {
      type: Date,
      required: [true, 'Ngày đặt bàn là bắt buộc']
    },
    gioDat: {
      type: String,
      required: [true, 'Giờ đặt bàn là bắt buộc']
    },
    soLuongKhach: {
      type: Number,
      required: true,
      set: function(v) {
        if (typeof v === 'string') {
          return parseInt(v, 10);
        }
        return Number(v);
      }
    },
    buffetNguoiLon: {
      type: String,
      enum: ['269.000', '329.000', '419.000', '499.000'],
      default: '269.000'
    },
    buffetTreEm: {
      type: String,
      enum: ['FREE', '40%'],
      default: 'FREE'
    },
    soLuongNguoiLon: {
      type: Number,
      default: 0,
      set: function(v) {
        if (typeof v === 'string') {
          return parseInt(v, 10);
        }
        return Number(v);
      }
    },
    soLuongTreEm: {
      type: Number,
      default: 0,
      set: function(v) {
        if (typeof v === 'string') {
          return parseInt(v, 10);
        }
        return Number(v);
      }
    },
    ghiChu: {
      type: String
    },
    trangThai: {
      type: String,
      enum: ['Chờ xác nhận', 'Đã xác nhận', 'Đã hủy', 'Hoàn thành'],
      default: 'Chờ xác nhận'
    },
    monAnDat: [
      {
        monAn: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MonAn'
        },
        tenMon: String,
        soLuong: {
          type: Number,
          default: 1,
          set: function(v) {
            return typeof v === 'string' ? parseInt(v) : Number(v);
          }
        },
        gia: {
          type: Number,
          default: 0,
          set: function(v) {
            return typeof v === 'string' ? parseInt(v) : Number(v);
          }
        },
        ghiChu: String
      }
    ],
    tongTien: {
      type: Number,
      default: 0,
      set: function(v) {
        return typeof v === 'string' ? parseInt(v) : Number(v);
      }
    },
    thanhToan: {
      trangThai: {
        type: String,
        enum: ['Chưa thanh toán', 'Đang xử lý', 'Đã thanh toán', 'Thanh toán lỗi'],
        default: 'Chưa thanh toán'
      },
      phuongThuc: {
        type: String,
        enum: ['Tiền mặt', 'MoMo', 'ZaloPay', 'VNPay'],
        default: 'Tiền mặt'
      },
      ngayThanhToan: {
        type: Date
      },
      payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
      }
    }
  },
  {
    timestamps: true
  }
);

// Log thay đổi trạng thái
thongTinDatBanSchema.pre('save', function(next) {
  if (this.isModified('trangThai')) {
    try {
      console.log(`Trạng thái đơn đặt bàn ${this._id} được cập nhật thành: ${this.trangThai}`);
      logger.info(`Trạng thái đơn đặt bàn ${this._id} được cập nhật thành: ${this.trangThai}`);
    } catch (error) {
      console.error('Lỗi khi ghi log thay đổi trạng thái:', error);
    }
  }
  next();
});

const ThongTinDatBan = mongoose.model('ThongTinDatBan', thongTinDatBanSchema);

module.exports = ThongTinDatBan; 