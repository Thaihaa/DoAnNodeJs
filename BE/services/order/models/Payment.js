const mongoose = require('mongoose');
const logger = require('../../../utils/logger');

const paymentSchema = new mongoose.Schema(
  {
    // Liên kết với đơn đặt bàn
    datBanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThongTinDatBan',
      required: true
    },
    
    // Thông tin khách hàng
    hoTen: {
      type: String,
      required: true
    },
    soDienThoai: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    
    // Thông tin thanh toán
    phuongThuc: {
      type: String,
      enum: ['momo', 'zalopay', 'vnpay', 'tienmat'],
      default: 'momo'
    },
    soTien: {
      type: Number,
      required: true
    },
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    requestId: {
      type: String
    },
    transId: {
      type: String
    },
    
    // Thông tin trạng thái
    trangThai: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending'
    },
    thongTinGiaoDich: {
      type: Object
    },
    moTa: {
      type: String
    },
    
    // Thông tin response từ cổng thanh toán
    payUrl: {
      type: String
    },
    deeplink: {
      type: String
    },
    qrCodeUrl: {
      type: String
    },
    
    // Ngày tạo và cập nhật
    ngayThanhToan: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Log thay đổi trạng thái thanh toán
paymentSchema.pre('save', function(next) {
  if (this.isModified('trangThai')) {
    try {
      logger.info(`Trạng thái thanh toán ${this._id} được cập nhật thành: ${this.trangThai}`);
    } catch (error) {
      console.error('Lỗi khi ghi log thay đổi trạng thái thanh toán:', error);
    }
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 