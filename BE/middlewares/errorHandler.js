const logger = require('../utils/logger');
const responseHandler = require('../utils/responseHandler');

/**
 * Middleware xử lý lỗi 404 - Không tìm thấy tài nguyên
 * @param {object} req - Đối tượng yêu cầu Express
 * @param {object} res - Đối tượng phản hồi Express
 * @param {function} next - Hàm next của Express
 */
const notFound = (req, res, next) => {
  // Kiểm tra URL có phải là chuỗi QR code của MoMo hay không
  if (req.originalUrl.includes('00020101021226110007vn.momo')) {
    console.log('Phát hiện yêu cầu QR code MoMo trong middleware notFound, chuyển hướng về trang thanh toán');
    
    // Chuyển hướng về trang thanh toán của frontend
    const baseRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${baseRedirectUrl}/payment`);
  }
  
  // Xử lý các trường hợp 404 thông thường
  const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware xử lý các lỗi khác
 * @param {object} err - Đối tượng lỗi
 * @param {object} req - Đối tượng yêu cầu Express
 * @param {object} res - Đối tượng phản hồi Express
 * @param {function} next - Hàm next của Express
 */
const errorHandler = (err, req, res, next) => {
  // Ghi log
  logger.error(`${err.message}\n${err.stack}`);

  // Xác định mã trạng thái
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  
  // Xử lý lỗi validation từ express-validator
  if (err.array && typeof err.array === 'function') {
    return responseHandler.validationError(res, 'Lỗi xác thực dữ liệu', err.array());
  }

  // Xử lý lỗi mongoose validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return responseHandler.validationError(res, 'Lỗi xác thực dữ liệu', errors);
  }

  // Xử lý lỗi mongoose CastError (ID không hợp lệ)
  if (err.name === 'CastError') {
    return responseHandler.badRequest(res, `ID không hợp lệ: ${err.value}`);
  }

  // Xử lý lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    return responseHandler.unauthorized(res, 'Token không hợp lệ');
  }

  // Xử lý lỗi JWT hết hạn
  if (err.name === 'TokenExpiredError') {
    return responseHandler.unauthorized(res, 'Token đã hết hạn');
  }

  // Xử lý lỗi trùng khóa MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return responseHandler.conflict(res, `${field} đã tồn tại trong hệ thống`);
  }

  // Xử lý lỗi mặc định
  return responseHandler.error(
    res,
    statusCode,
    process.env.NODE_ENV === 'production' 
      ? 'Đã xảy ra lỗi, vui lòng thử lại sau' 
      : err.message
  );
};

module.exports = { notFound, errorHandler }; 