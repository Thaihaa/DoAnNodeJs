const Role = require('../models/Role');
const logger = require('../../../utils/logger');

// Lấy danh sách vai trò
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    logger.error(`Lỗi lấy danh sách vai trò: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách vai trò',
      error: error.message
    });
  }
};

// Lấy chi tiết một vai trò
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }
    
    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    logger.error(`Lỗi lấy chi tiết vai trò: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết vai trò',
      error: error.message
    });
  }
};

// Tạo vai trò mới
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Kiểm tra vai trò đã tồn tại
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò đã tồn tại'
      });
    }
    
    // Tạo vai trò mới
    const role = await Role.create({
      name,
      description,
      permissions: permissions || []
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo vai trò thành công',
      data: role
    });
  } catch (error) {
    logger.error(`Lỗi tạo vai trò: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo vai trò',
      error: error.message
    });
  }
};

// Cập nhật vai trò
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions, isActive } = req.body;
    
    // Tìm vai trò
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }
    
    // Kiểm tra nếu đổi tên, tên mới đã tồn tại chưa
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Tên vai trò đã tồn tại'
        });
      }
    }
    
    // Cập nhật thông tin
    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;
    
    const updatedRole = await role.save();
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật vai trò thành công',
      data: updatedRole
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

// Xóa vai trò
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }
    
    // Không cho phép xóa vai trò mặc định
    if (['admin', 'staff', 'user'].includes(role.name)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa vai trò mặc định'
      });
    }
    
    await role.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Xóa vai trò thành công'
    });
  } catch (error) {
    logger.error(`Lỗi xóa vai trò: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa vai trò',
      error: error.message
    });
  }
};

// Khởi tạo các vai trò mặc định
exports.initDefaultRoles = async () => {
  try {
    await Role.initRoles();
  } catch (error) {
    logger.error(`Lỗi khởi tạo vai trò mặc định: ${error.message}`);
  }
}; 