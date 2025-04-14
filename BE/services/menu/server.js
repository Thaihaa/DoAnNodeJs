const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('../../middlewares/errorHandler');
const loaiMonAnRoutes = require('./routes/loaiMonAnRoutes');
const monAnRoutes = require('./routes/monAnRoutes');
const config = require('../../config');
const logger = require('../../utils/logger');
const path = require('path');
require('./models/NhaHang');

// Tải biến môi trường
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Khởi tạo app
const app = express();

// Thiết lập middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: false
}));

// Thiết lập giới hạn thời gian xử lý
app.use((req, res, next) => {
  // Tăng timeout lên 2 phút cho tất cả request
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/loai-mon-an', loaiMonAnRoutes);
app.use('/api/mon-an', monAnRoutes);

// Kiểm tra kết nối
app.get('/api/menu/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Menu Service',
    time: new Date().toISOString()
  });
});

// Middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

// Kết nối đến MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    logger.info('Kết nối MongoDB thành công (Menu Service)');
    
    // Khởi động server
    const PORT = config.servicePorts.menu || 5003;
    app.listen(PORT, () => {
      logger.info(`Menu Service đang chạy trên cổng ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`Lỗi kết nối MongoDB (Menu Service): ${error.message}`);
    process.exit(1);
  }); 