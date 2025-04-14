const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('./utils/logger');
const config = require('./config');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

// Khởi tạo ứng dụng Express
const app = express();

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info(`Đã tạo thư mục uploads: ${uploadsDir}`);
}

// Đảm bảo thư mục tmp tồn tại
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  logger.info(`Đã tạo thư mục tmp: ${tmpDir}`);
}

const corsOptions = {
  origin: true, // Cho phép tất cả các origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'cache-control'], // Thêm cache-control
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Áp dụng CORS cho tất cả các routes
app.use(cors(corsOptions));

// Xử lý OPTIONS requests
app.options('*', cors(corsOptions));

// Middleware cơ bản
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Middleware uploading file
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  abortOnLimit: true,
  responseOnLimit: "Kích thước file quá lớn (giới hạn 10MB)",
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  parseNested: true,
  debug: process.env.NODE_ENV !== 'production'
}));

// Middleware logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Log các request đến server
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logger.info(`Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Phục vụ files tĩnh
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));
// Đường dẫn cụ thể cho avatars
app.use('/avatars', express.static(path.join(__dirname, '../FE/public/avatars')));

// Route đặc biệt để phục vụ default-avatar.svg khi yêu cầu default-avatar.png
app.get('/avatars/default-avatar.png', (req, res) => {
  res.sendFile(path.join(__dirname, '../FE/public/avatars/default-avatar.svg'));
});

app.get('/default-avatar.png', (req, res) => {
  res.sendFile(path.join(__dirname, '../FE/public/avatars/default-avatar.svg'));
});

// Thêm route cho admin/default-avatar.png
app.get('/admin/default-avatar.png', (req, res) => {
  res.sendFile(path.join(__dirname, '../FE/public/avatars/default-avatar.svg'));
});

// Đăng ký API upload ảnh với MongoDB GridFS
// Đảm bảo các thư mục cần thiết đã được tạo
const uploadServiceDir = path.join(__dirname, 'services', 'upload');
if (!fs.existsSync(uploadServiceDir)) {
  fs.mkdirSync(uploadServiceDir, { recursive: true });
  logger.info(`Đã tạo thư mục services/upload: ${uploadServiceDir}`);
}

// Import và sử dụng các route upload
try {
  const uploadRoutes = require('./services/upload/uploadRoutes');
  // Route gốc cho API upload
  app.use('/api', uploadRoutes);
  logger.info('Đã đăng ký các route upload GridFS');
} catch (error) {
  logger.error(`Lỗi khi đăng ký routes upload: ${error.message}`);
}

// Route đơn giản để kiểm tra server
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Restaurant API đang hoạt động',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uploadsDir: uploadsDir
  });
});

// Route upload file API (DEPRECATED - Sẽ bị loại bỏ sau khi GridFS hoạt động ổn định)
app.post('/api/upload', async (req, res) => {
  try {
    logger.info('>>>>> Nhận request upload ảnh: POST /api/upload (DEPRECATED)');
    logger.info(`Headers: ${JSON.stringify(req.headers)}`);
    
    // Debug để kiểm tra request
    if (!req.files) {
      logger.error('Không phát hiện files trong request');
      logger.error('Request body:', req.body);
      logger.error('Content-Type:', req.headers['content-type']);
      
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy file tải lên. Vui lòng gửi file với key "image"'
      });
    }
    
    logger.info(`Files:`, req.files);
    
    // Kiểm tra nhanh xem request có phải là multipart/form-data
    if (!req.files.image) {
      logger.error('Không có file với key "image"');
      logger.error('Các keys có sẵn:', Object.keys(req.files));
      
      return res.status(400).json({
        success: false,
        message: 'Vui lòng gửi file với key "image"'
      });
    }
    
    const uploadedFile = req.files.image;
    logger.info(`Thông tin file: name=${uploadedFile.name}, size=${uploadedFile.size}, mimetype=${uploadedFile.mimetype}`);

    // Whitelist các định dạng được phép
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ chấp nhận file định dạng: JPG, PNG, GIF, WEBP'
      });
    }

    // Kiểm tra kích thước file (đã được xử lý bởi middleware, nhưng check lại để chắc chắn)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Kích thước file không được vượt quá 10MB'
      });
    }

    // Tạo tên file an toàn
    const fileExt = path.extname(uploadedFile.name).toLowerCase();
    const safeFileName = `img_${Date.now()}${fileExt}`
      .replace(/[^a-z0-9\-_\.]/gi, '') // Chỉ giữ lại chữ cái, số và một số ký tự đặc biệt
      .replace(/\s+/g, '-'); // Thay khoảng trắng bằng dấu gạch ngang
    
    const uploadPath = path.join(uploadsDir, safeFileName);
    logger.info(`Đang lưu file vào: ${uploadPath}`);
    
    // Di chuyển file đến thư mục đích
    await uploadedFile.mv(uploadPath);
      
    // Đường dẫn tương đối và tuyệt đối
    const relativePath = `/uploads/${safeFileName}`;
    const absoluteUrl = `${req.protocol}://${req.get('host')}${relativePath}`;
    
    logger.info(`File đã được lưu thành công: ${uploadPath}`);
    logger.info(`URL tạo ra: ${absoluteUrl}`);
    
    // Trả về thành công
    res.status(200).json({
      success: true,
      message: 'Tải ảnh lên thành công',
      url: absoluteUrl,
      fileName: safeFileName
    });

  } catch (error) {
    logger.error(`Lỗi ngoại lệ khi xử lý upload: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xử lý file',
      error: error.message
    });
  }
});

// Thiết lập proxy cho các services
// Proxy cho Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: config.serviceUrls.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api'
  },
  logLevel: 'error'
}));

// Proxy cho Menu Service với timeout tăng lên
app.use('/api/mon-an', createProxyMiddleware({
  target: config.serviceUrls.menu,
  changeOrigin: true,
  pathRewrite: {
    '^/api/mon-an': '/api/mon-an'
  },
  logLevel: 'error',
  timeout: 120000,
  proxyTimeout: 120000
}));

// Proxy cho Menu Service (loại món ăn)
app.use('/api/loai-mon-an', createProxyMiddleware({
  target: config.serviceUrls.menu,
  changeOrigin: true,
  pathRewrite: {
    '^/api/loai-mon-an': '/api/loai-mon-an'
  },
  logLevel: 'error'
}));

// Proxy cho Order Service
app.use('/api/dat-ban', createProxyMiddleware({
  target: config.serviceUrls.order,
  changeOrigin: true,
  pathRewrite: {
    '^/api/dat-ban': '/api/dat-ban'
  },
  logLevel: 'error'
}));

// Proxy cho Payment API
app.use('/api/payment', createProxyMiddleware({
  target: config.serviceUrls.order,
  changeOrigin: true,
  pathRewrite: {
    '^/api/payment': '/api/payment'
  },
  logLevel: 'debug',
  secure: false,
  followRedirects: true,
  onError: (err, req, res) => {
    logger.error(`Payment Proxy Error: ${err.message}`);
    console.error(`Detailed Payment Proxy Error: ${err.stack}`);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Lỗi kết nối đến dịch vụ thanh toán',
        error: err.message
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log toàn bộ thông tin request để debug
    console.log(`[PAYMENT PROXY] Forwarding ${req.method} ${req.url}`);
    console.log(`[PAYMENT PROXY] Original URL: ${req.originalUrl}`);
    console.log(`[PAYMENT PROXY] Headers:`, req.headers);
    
    // Chuyển tiếp token xác thực nếu có
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log(`[PAYMENT PROXY] Authorization header forwarded`);
    }
    
    // Xử lý dữ liệu POST
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      console.log(`[PAYMENT PROXY] Request body:`, req.body);
      const contentType = req.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // Ghi body vào request
        proxyReq.write(bodyData);
        console.log(`[PAYMENT PROXY] JSON body forwarded, length: ${Buffer.byteLength(bodyData)}`);
      }
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PAYMENT PROXY] Received response from Order service: ${proxyRes.statusCode}`);
    
    // Log status code của phản hồi
    const statusCode = proxyRes.statusCode;
    if (statusCode >= 400) {
      console.log(`[PAYMENT PROXY] Error response: ${statusCode}`);
    }
    
    // Log headers của phản hồi
    console.log(`[PAYMENT PROXY] Response headers:`, proxyRes.headers);
  }
}));

// Proxy cho Review Service
app.use('/api/review', createProxyMiddleware({
  target: config.serviceUrls.review,
  changeOrigin: true,
  pathRewrite: {
    '^/api/review': '/api/review'
  },
  logLevel: 'error'
}));

// Middleware xử lý lỗi 404 và các lỗi khác - ĐẶT SAU CÙNG
app.use(notFound);
app.use(errorHandler);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server đang chạy trên cổng ${PORT}`);
});

module.exports = app; 