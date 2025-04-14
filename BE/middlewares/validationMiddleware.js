const { validationResult } = require('express-validator');
const responseHandler = require('../utils/responseHandler');

/**
 * Middleware xử lý kết quả xác thực từ express-validator
 * @param {object} req - Đối tượng yêu cầu Express
 * @param {object} res - Đối tượng phản hồi Express
 * @param {function} next - Hàm next của Express
 */
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return responseHandler.validationError(
      res, 
      'Lỗi xác thực dữ liệu', 
      errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    );
  }
  
  next();
};

/**
 * Xử lý kết quả xác thực và chuyển đổi dữ liệu khi cần
 * @param {array} validators - Mảng các hàm xác thực từ express-validator
 * @returns {array} Mảng middleware
 */
exports.validate = (validators) => {
  return [
    ...validators,
    exports.validateRequest
  ];
}; 