const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const config = require('../../../config');
const logger = require('../../../utils/logger');
const Role = require('../models/Role');

// Tạo token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role 
    }, 
    config.jwt.secret, 
    {
      expiresIn: config.jwt.expiresIn
    }
  );
};

// Tạo refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

// Controller đăng ký người dùng
exports.register = async (req, res) => {
  try {
    logger.info('Đang xử lý yêu cầu đăng ký');
    const { username, email, password, fullName, phoneNumber, address, role } = req.body;

    // Validate dữ liệu đầu vào
    if (!username || !email || !password) {
      logger.warn('Thiếu thông tin đăng ký');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ tên đăng nhập, email và mật khẩu'
      });
    }

    // Tìm kiếm user hiện có
    let userExists;
    try {
      userExists = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
    } catch (err) {
      logger.error(`Lỗi khi kiểm tra tài khoản: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống, vui lòng thử lại sau'
      });
    }

    if (userExists) {
      logger.warn(`Tài khoản đã tồn tại: ${username}`);
      return res.status(400).json({
        success: false,
        message: 'Email hoặc tên đăng nhập đã tồn tại'
      });
    }

    // Xác định vai trò người dùng
    let userRole = 'user'; // Mặc định là 'user'
    
    // Nếu người tạo là admin và có vai trò được gửi lên
    if (req.user && req.user.role === 'admin' && role && ['user', 'staff', 'admin'].includes(role)) {
      userRole = role;
      logger.info(`Admin đang tạo tài khoản với vai trò: ${role}`);
    }
    
    // Tìm vai trò trong cơ sở dữ liệu
    const roleDocument = await Role.findOne({ name: userRole });
    
    // Tạo user mới
    let user;
    try {
      user = new User({
        username,
        email,
        password,
        fullName: fullName || '',
        phoneNumber: phoneNumber || '',
        address: address || '',
        role: userRole,
        roleId: roleDocument ? roleDocument._id : null
      });
      
      await user.save();
    } catch (err) {
      logger.error(`Lỗi khi tạo tài khoản: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo tài khoản, vui lòng thử lại sau'
      });
    }

    // Tạo token đơn giản
    const token = generateToken(user);

    // Trả về kết quả
    logger.info(`Đăng ký thành công: ${username} với vai trò ${userRole}`);
    
    // Lọc bỏ trường password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: userResponse,
      token
    });
  } catch (error) {
    logger.error(`Lỗi tổng thể khi đăng ký: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Lỗi đăng ký tài khoản, vui lòng thử lại sau'
    });
  }
};

// Controller đăng nhập
exports.login = async (req, res) => {
  try {
    // Lấy thông tin đăng nhập
    const { username, password } = req.body || {};
    
    // Kiểm tra đầy đủ thông tin
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu'
      });
    }
    
    // Tìm kiếm người dùng
    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username } // Cho phép đăng nhập bằng email
      ] 
    }).select('+password +isActive +role');
    
    // Kiểm tra người dùng tồn tại
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // Tạo token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user._id);
    
    // Lưu refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    // Trả về kết quả
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    logger.error(`Lỗi đăng nhập: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập, vui lòng thử lại sau'
    });
  }
};

// Controller lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    logger.error(`Lỗi lấy thông tin người dùng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin người dùng',
      error: error.message
    });
  }
};

// Controller làm mới token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token không được cung cấp'
      });
    }

    // Xác thực refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    
    // Tìm user với refresh token
    const user = await User.findOne({ _id: decoded.id, refreshToken });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Tạo token mới
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user._id);

    // Cập nhật refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error(`Lỗi làm mới token: ${error.message}`);
    res.status(401).json({
      success: false,
      message: 'Refresh token không hợp lệ hoặc đã hết hạn',
      error: error.message
    });
  }
};

// Controller đăng xuất
exports.logout = async (req, res) => {
  try {
    // Xóa cookie token
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    // Xóa refresh token khỏi database
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    logger.error(`Lỗi đăng xuất: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng xuất',
      error: error.message
    });
  }
}; 