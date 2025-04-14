const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const config = require('../config');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

/**
 * Middleware xác thực người dùng bằng JWT
 * @param {object} req - Đối tượng yêu cầu Express
 * @param {object} res - Đối tượng phản hồi Express
 * @param {function} next - Hàm next của Express
 */
exports.protect = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // Hoặc từ cookie
      token = req.cookies.jwt;
    }

    // Kiểm tra token có tồn tại không
    if (!token) {
      return responseHandler.unauthorized(res, 'Bạn chưa đăng nhập, vui lòng đăng nhập để truy cập');
    }

    // Xác thực token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Thiết lập thông tin người dùng vào request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    
    if (error.name === 'JsonWebTokenError') {
      return responseHandler.unauthorized(res, 'Token không hợp lệ');
    }
    
    if (error.name === 'TokenExpiredError') {
      return responseHandler.unauthorized(res, 'Token đã hết hạn');
    }
    
    return responseHandler.serverError(res);
  }
};

/**
 * Middleware giới hạn quyền truy cập dựa trên vai trò người dùng
 * @param  {...string} roles - Các vai trò được phép truy cập
 * @returns {function} Middleware Express
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Kiểm tra nếu vai trò người dùng không nằm trong danh sách được phép
    if (!roles.includes(req.user.role)) {
      return responseHandler.forbidden(res, 'Bạn không có quyền thực hiện hành động này');
    }

    next();
  };
};

/**
 * Middleware kiểm tra quyền sở hữu tài nguyên
 * @param {function} getResourceOwner - Hàm trả về ID của chủ sở hữu tài nguyên
 * @returns {function} Middleware Express
 */
exports.isOwner = (getResourceOwner) => {
  return async (req, res, next) => {
    try {
      // Lấy ID của chủ sở hữu tài nguyên
      const ownerId = await getResourceOwner(req);
      
      // Nếu người dùng là admin, cho phép truy cập
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu không
      if (req.user.id !== ownerId.toString()) {
        return responseHandler.forbidden(res, 'Bạn không có quyền thao tác với tài nguyên này');
      }

      next();
    } catch (error) {
      logger.error(`isOwner middleware error: ${error.message}`);
      return responseHandler.serverError(res);
    }
  };
};

// Middleware xác thực token
exports.authenticateToken = (req, res, next) => {
  try {
    // Lấy token từ headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực'
      });
    }

    // Giải mã token với error handling tốt hơn
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwt.secret);
      
      // Lưu thông tin người dùng vào request
      req.user = {
        id: decoded.id,
        role: decoded.role || 'user', // Lấy role từ token hoặc mặc định là 'user'
        iat: decoded.iat,
        exp: decoded.exp
      };
      
      // Log cho debug nếu cần
      console.log(`User đã xác thực:`, req.user);
      
      next();
    } catch (jwtError) {
      logger.error(`Lỗi xác thực JWT: ${jwtError.message}`);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token đã hết hạn, vui lòng đăng nhập lại',
          error: jwtError.message
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(403).json({
          success: false,
          message: 'Token không hợp lệ',
          error: jwtError.message
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Lỗi xác thực token',
        error: jwtError.message
      });
    }
  } catch (error) {
    logger.error(`Lỗi xác thực ngoài JWT: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực',
      error: error.message
    });
  }
};

// Nếu sử dụng fetch để lấy thông tin người dùng từ roles
const fetchUserWithRole = async (userId) => {
  try {
    const response = await fetch(`http://localhost:${config.servicePorts.auth}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.serviceToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Không thể lấy thông tin người dùng');
    }
    
    const userData = await response.json();
    return userData.user;
  } catch (error) {
    logger.error(`Lỗi lấy thông tin người dùng: ${error.message}`);
    return null;
  }
};

// Middleware kiểm tra quyền admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logger.warn(`Người dùng không có quyền admin: ${JSON.stringify(req.user)}`);
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện hành động này'
    });
  }
  next();
};

// Middleware kiểm tra quyền staff hoặc admin
exports.isStaffOrAdmin = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện hành động này'
    });
  }
  next();
};

// Middleware kiểm tra quyền cụ thể
exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Truy cập bị từ chối. Bạn không có quyền!'
        });
      }
      
      // Nếu sử dụng User model trực tiếp
      const User = mongoose.model('User');
      const user = await User.findById(req.user.id).populate('roleId');
      
      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Truy cập bị từ chối. Không tìm thấy người dùng!'
        });
      }
      
      // Admin có toàn quyền
      if (user.role === 'admin' || (user.roleId && user.roleId.name === 'admin')) {
        return next();
      }
      
      // Kiểm tra quyền cụ thể
      if (
        user.roleId && 
        (user.roleId.permissions.includes(permission) || user.roleId.permissions.includes('all'))
      ) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: `Truy cập bị từ chối. Bạn không có quyền ${permission}!`
      });
    } catch (error) {
      logger.error(`Lỗi kiểm tra quyền ${permission}: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi kiểm tra quyền'
      });
    }
  };
}; 