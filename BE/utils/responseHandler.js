/**
 * Tiện ích xử lý các phản hồi API một cách nhất quán
 */

/**
 * Gửi phản hồi thành công
 * @param {object} res - Đối tượng phản hồi Express
 * @param {number} statusCode - Mã trạng thái HTTP
 * @param {string} message - Thông báo thành công
 * @param {object|array} data - Dữ liệu để trả về
 * @param {object} meta - Metadata bổ sung (ví dụ: thông tin phân trang)
 */
exports.success = (res, statusCode = 200, message = 'Thành công', data = null, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

/**
 * Gửi phản hồi lỗi
 * @param {object} res - Đối tượng phản hồi Express
 * @param {number} statusCode - Mã trạng thái HTTP
 * @param {string} message - Thông báo lỗi
 * @param {object} errors - Chi tiết lỗi (tùy chọn)
 */
exports.error = (res, statusCode = 500, message = 'Lỗi server', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Gửi phản hồi lỗi 400 Bad Request
 * @param {object} res - Đối tượng phản hồi Express
 * @param {string} message - Thông báo lỗi
 * @param {object} errors - Chi tiết lỗi (tùy chọn)
 */
exports.badRequest = (res, message = 'Yêu cầu không hợp lệ', errors = null) => {
  return this.error(res, 400, message, errors);
};

/**
 * Gửi phản hồi lỗi 401 Unauthorized
 * @param {object} res - Đối tượng phản hồi Express
 * @param {string} message - Thông báo lỗi
 */
exports.unauthorized = (res, message = 'Không được phép truy cập') => {
  return this.error(res, 401, message);
};

/**
 * Gửi phản hồi lỗi 403 Forbidden
 * @param {object} res - Đối tượng phản hồi Express
 * @param {string} message - Thông báo lỗi
 */
exports.forbidden = (res, message = 'Truy cập bị từ chối') => {
  return this.error(res, 403, message);
};

/**
 * Gửi phản hồi lỗi 404 Not Found
 * @param {object} res - Đối tượng phản hồi Express
 * @param {string} message - Thông báo lỗi
 */
exports.notFound = (res, message = 'Không tìm thấy tài nguyên') => {
  return this.error(res, 404, message);
};

/**
 * Gửi phản hồi lỗi 409 Conflict
 * @param {object} res - Đối tượng phản hồi Express
 * @param {string} message - Thông báo lỗi
 */
exports.conflict = (res, message = 'Xung đột dữ liệu') => {
  return this.error(res, 409, message);
};

/**
 * Gửi phản hồi lỗi 422 Unprocessable Entity
 * @param {object} res - Đối tượng phản hồi Express
 * @param {string} message - Thông báo lỗi
 * @param {object} errors - Chi tiết lỗi (tùy chọn)
 */
exports.validationError = (res, message = 'Lỗi xác thực dữ liệu', errors = null) => {
  return this.error(res, 422, message, errors);
};

/**
 * Gửi phản hồi lỗi 500 Internal Server Error
 * @param {object} res - Đối tượng phản hồi Express
 * @param {string} message - Thông báo lỗi
 */
exports.serverError = (res, message = 'Lỗi máy chủ nội bộ') => {
  return this.error(res, 500, message);
}; 