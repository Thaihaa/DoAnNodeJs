const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('../../middlewares/errorHandler');
const danhGiaRoutes = require('./routes/danhGiaRoutes');
const config = require('../../config');
const logger = require('../../utils/logger');
const path = require('path');

// Tải biến môi trường
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Khởi tạo app
const app = express();

// Thiết lập middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.cors.origin
}));
app.use(helmet());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/danh-gia', danhGiaRoutes);

// Kiểm tra kết nối
app.get('/api/review/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Review Service',
    time: new Date().toISOString()
  });
});

// Middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

// Kết nối đến MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    logger.info('Kết nối MongoDB thành công (Review Service)');
    
    // Khởi động server
    const PORT = config.servicePorts.review || 5005;
    app.listen(PORT, () => {
      logger.info(`Review Service đang chạy trên cổng ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`Lỗi kết nối MongoDB (Review Service): ${error.message}`);
    process.exit(1);
  }); 