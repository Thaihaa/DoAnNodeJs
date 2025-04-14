const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Trước khi định nghĩa schema, thử xóa các index cũ
try {
  if (mongoose.connection.readyState === 1) {
    // Xóa các index cũ nếu tồn tại
    mongoose.connection.db.collection('users').dropIndexes().catch(() => {});
  }
} catch (error) {
  console.log('Lỗi khi xóa index:', error.message);
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Tên đăng nhập là bắt buộc'],
      trim: true
    },
    tenDangNhap: { // Thêm field này để tương thích với dữ liệu cũ
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
    },
    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc']
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    address: {
      type: String
    },
    avatar: {
      type: String,
      default: 'default-avatar.svg'
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    },
    role: {
      type: String,
      enum: ['user', 'staff', 'admin'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    refreshToken: String
  },
  {
    timestamps: true
  }
);

// Xóa các field trống trước khi insert
userSchema.pre('save', function(next) {
  // Nếu không có tenDangNhap, gán bằng username
  if (!this.tenDangNhap && this.username) {
    this.tenDangNhap = this.username;
  }
  // Nếu không có username, gán bằng tenDangNhap
  if (!this.username && this.tenDangNhap) {
    this.username = this.tenDangNhap;
  }
  
  // Xóa các field nếu null/undefined/rỗng
  for (const key in this._doc) {
    if (this._doc[key] === null || this._doc[key] === undefined || this._doc[key] === '') {
      delete this._doc[key];
    }
  }
  next();
});

// Thêm index KHÔNG dùng unique: true trên schema
// Thay vào đó thêm index một cách thủ công
userSchema.index({ username: 1 }, { sparse: true, background: true });
userSchema.index({ tenDangNhap: 1 }, { sparse: true, background: true });
userSchema.index({ email: 1 }, { sparse: true, background: true });

// Hash mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Tạo admin mặc định
userSchema.statics.createDefaultAdmin = async function(Role) {
  try {
    // Kiểm tra xem đã có admin chưa
    const adminExists = await this.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('Tạo tài khoản Admin mặc định...');
      
      // Tìm role admin
      let adminRole = null;
      try {
        adminRole = await Role.findOne({ name: 'admin' });
      } catch (error) {
        console.error('Lỗi khi tìm role admin:', error.message);
      }
      
      // Tạo tên duy nhất để tránh lỗi
      const timestamp = Date.now();
      const adminUsername = `admin_${timestamp}`;
      
      // Tạo admin mặc định
      const admin = new this({
        username: adminUsername,
        tenDangNhap: adminUsername,
        email: `admin_${timestamp}@nhahang.com`,
        password: 'Admin@123',
        fullName: 'Quản trị viên',
        role: 'admin',
        roleId: adminRole ? adminRole._id : null,
        isActive: true
      });
      
      try {
        await admin.save();
        console.log('Đã tạo tài khoản Admin mặc định:');
        console.log('Username:', admin.username);
        console.log('Password: Admin@123');
      } catch (error) {
        console.error('Lỗi khi lưu admin:', error.message);
      }
    }
  } catch (error) {
    console.error('Lỗi tạo admin mặc định:', error);
  }
};

// Xóa model User nếu đã tồn tại để tránh lỗi OverwriteModelError
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model('User', userSchema);

module.exports = User; 