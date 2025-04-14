const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên vai trò là bắt buộc'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware pre-save để tự động cập nhật trường updatedAt
roleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Phương thức tĩnh để khởi tạo các vai trò mặc định
roleSchema.statics.initRoles = async function() {
  const defaultRoles = [
    {
      name: 'admin',
      description: 'Quản trị viên hệ thống',
      permissions: ['all']
    },
    {
      name: 'staff',
      description: 'Nhân viên nhà hàng',
      permissions: ['manage_orders', 'manage_menu', 'view_reports']
    },
    {
      name: 'user',
      description: 'Người dùng thông thường',
      permissions: ['view_menu', 'place_order', 'write_review']
    }
  ];

  try {
    for (const role of defaultRoles) {
      await this.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    throw new Error(`Lỗi khởi tạo vai trò mặc định: ${error.message}`);
  }
};

module.exports = mongoose.model('Role', roleSchema); 