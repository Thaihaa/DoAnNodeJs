const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('../../middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const roleController = require('./controllers/roleController');
const Role = require('./models/Role');
const User = require('./models/User');
const config = require('../../config');
const logger = require('../../utils/logger');
const path = require('path');

// Tải biến môi trường
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Khởi tạo app
const app = express();

// Thiết lập middleware cơ bản
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CORS đơn giản
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));

// Logging cơ bản
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Log request đơn giản
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Health check
app.get('/api/auth/health', (req, res) => {
  res.status(200).json({ status: 'Auth service is running' });
});

// Đăng ký người dùng mới
app.post('/api/register', async (req, res) => {
  // ... existing code ...
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
  // ... existing code ...
});

// Middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

// Kết nối MongoDB và khởi động server
const PORT = config.servicePorts.auth || 5001;

mongoose.connect(config.mongodb.uri)
  .then(() => {
    logger.info('Kết nối MongoDB thành công (Auth Service)');
    
    // Khởi tạo dữ liệu mặc định
    roleController.initDefaultRoles();
    User.createDefaultAdmin(Role);
    
    // Khởi động server
    app.listen(PORT, () => {
      logger.info(`Auth Service đang chạy trên cổng ${PORT}`);
    });
  })
  .catch(err => {
    logger.error(`Lỗi kết nối MongoDB: ${err.message}`);
    process.exit(1);
  }); 