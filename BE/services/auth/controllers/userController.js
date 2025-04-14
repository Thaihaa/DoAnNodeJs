const User = require('../models/User');
const logger = require('../../../utils/logger');
const bcrypt = require('bcrypt');

// Lấy danh sách người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword
      ? {
          $or: [
            { username: { $regex: req.query.keyword, $options: 'i' } },
            { email: { $regex: req.query.keyword, $options: 'i' } },
            { fullName: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(keyword)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(keyword);

    res.status(200).json({
      success: true,
      users,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    });
  } catch (error) {
    logger.error(`Lỗi lấy danh sách người dùng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách người dùng',
      error: error.message
    });
  }
};

// Lấy thông tin người dùng theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');

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

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { fullName, phoneNumber, address, avatar, email, role } = req.body;
    const userId = req.params.id;
    
    // Tìm người dùng bằng findById
    const user = await User.findById(userId);

    if (!user) {
      logger.error(`Cập nhật thất bại: Không tìm thấy user với ID ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra quyền - chỉ admin hoặc chính người dùng đó mới có thể cập nhật
    if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
      logger.error(`Cập nhật thất bại: User ${req.user.id} không có quyền cập nhật user ${userId}`);
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật thông tin người dùng này'
      });
    }

    // Cập nhật thông tin - chỉ cập nhật các trường được gửi lên
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (email !== undefined && req.user.role === 'admin') updateData.email = email;
    if (role !== undefined && req.user.role === 'admin') updateData.role = role;

    // Sử dụng findByIdAndUpdate thay vì save() để tăng hiệu suất
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!updatedUser) {
      logger.error(`Lỗi cập nhật thông tin người dùng: không tìm thấy sau khi cập nhật`);
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật thông tin người dùng'
      });
    }

    logger.info(`Cập nhật thành công người dùng ${userId}`);
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật thông tin người dùng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thông tin người dùng',
      error: error.message
    });
  }
};

// Thay đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra quyền - chỉ chính người dùng đó mới có thể đổi mật khẩu
    if (req.user.id !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thay đổi mật khẩu người dùng này'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    logger.error(`Lỗi đổi mật khẩu: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi đổi mật khẩu',
      error: error.message
    });
  }
};

// Vô hiệu hóa tài khoản (chỉ admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Đảo ngược trạng thái
    user.isActive = !user.isActive;
    await user.save();

    const statusMessage = user.isActive ? 'kích hoạt' : 'vô hiệu hóa';

    res.status(200).json({
      success: true,
      message: `Tài khoản đã được ${statusMessage}`,
      isActive: user.isActive
    });
  } catch (error) {
    logger.error(`Lỗi thay đổi trạng thái người dùng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi thay đổi trạng thái người dùng',
      error: error.message
    });
  }
};

// Cập nhật vai trò người dùng (chỉ admin)
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật vai trò thành công',
      role: user.role
    });
  } catch (error) {
    logger.error(`Lỗi cập nhật vai trò: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật vai trò',
      error: error.message
    });
  }
};

// Nâng cấp quyền người dùng (chỉ dành cho Admin)
exports.setUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    // Validate dữ liệu
    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID người dùng hoặc vai trò'
      });
    }

    // Kiểm tra role hợp lệ
    if (!['user', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ. Vai trò hợp lệ: user, staff, admin'
      });
    }

    // Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Cập nhật vai trò người dùng
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Đã cập nhật vai trò của ${user.username} thành ${role}`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật vai trò người dùng',
      error: error.message
    });
  }
};

// Tạo tài khoản Admin mới (dành cho Super Admin)
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc tên đăng nhập đã tồn tại'
      });
    }

    // Tạo admin mới
    const newAdmin = new User({
      username,
      email,
      password,
      fullName,
      role: 'admin'
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản Admin thành công',
      user: {
        _id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo tài khoản Admin',
      error: error.message
    });
  }
};

// Đếm số lượng người dùng
exports.countUsers = async (req, res) => {
  try {
    // Không yêu cầu xác thực cho endpoint này khi được gọi từ nội bộ hệ thống
    const count = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    logger.error(`Lỗi đếm số lượng người dùng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đếm số lượng người dùng',
      error: error.message
    });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng với ID này'
      });
    }
    
    // Không cho phép xóa tài khoản admin cuối cùng
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa admin cuối cùng trong hệ thống'
        });
      }
    }
    
    // Xóa người dùng
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    logger.error(`Lỗi xóa người dùng: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa người dùng',
      error: error.message
    });
  }
}; 