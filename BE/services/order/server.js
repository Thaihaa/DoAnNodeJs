const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const { notFound, errorHandler } = require('../../middlewares/errorHandler');
const thongTinDatBanRoutes = require('./routes/thongTinDatBanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const config = require('../../config');
const logger = require('../../utils/logger');
const path = require('path');

// Tải biến môi trường
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Đăng ký models để tránh lỗi Schema hasn't been registered
// Model User
const userSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  email: String,
  role: String,
  isActive: Boolean
}, { timestamps: true });

// Model Ban
const banSchema = new mongoose.Schema({
  maBan: String,
  viTri: String,
  soLuongKhachToiDa: Number,
  trangThai: String,
  nhaHang: String
}, { timestamps: true });

// Đảm bảo rằng các model được đăng ký trước khi sử dụng
mongoose.model('User', userSchema);
mongoose.model('Ban', banSchema);

// Khởi tạo app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});

// Log khi Socket.IO khởi động
logger.info('Socket.IO đã được khởi tạo cho Order Service');

// Tạo phòng cho từng nhà hàng
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  // Kiểm tra danh sách phòng
  const rooms = io.sockets.adapter.rooms;
  logger.info(`Danh sách phòng hiện tại: ${JSON.stringify([...rooms.keys()])}`);
  logger.info(`Số client đang kết nối: ${io.engine.clientsCount}`);
  
  // Lắng nghe sự kiện tham gia phòng nhà hàng
  socket.on('join_restaurant', (restaurantId) => {
    const roomName = `restaurant_${restaurantId}`;
    socket.join(roomName);
    logger.info(`Socket ${socket.id} joined room: ${roomName}`);
    
    // Thông báo cho client
    socket.emit('joined_room', { 
      room: roomName, 
      message: `Đã tham gia phòng ${roomName}` 
    });
  });

  // Lắng nghe sự kiện tham gia phòng quản lý
  socket.on('join_admin', () => {
    socket.join('admin_room');
    logger.info(`Socket ${socket.id} joined room: admin_room`);
    
    // Thông báo cho client
    socket.emit('joined_room', { 
      room: 'admin_room', 
      message: 'Đã tham gia phòng admin' 
    });
  });
  
  // Lắng nghe sự kiện tham gia phòng khách hàng
  socket.on('join_user', (userId) => {
    const roomName = `user_${userId}`;
    socket.join(roomName);
    logger.info(`Socket ${socket.id} joined room: ${roomName}`);
    
    // Thông báo cho client
    socket.emit('joined_room', { 
      room: roomName, 
      message: `Đã tham gia phòng ${roomName}` 
    });
  });

  // Xử lý sự kiện ngắt kết nối
  socket.on('disconnect', (reason) => {
    logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Chia sẻ đối tượng io để có thể sử dụng trong controller
app.set('io', io);

// Thiết lập middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Cho phép tất cả các nguồn truy cập
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet());

// Phục vụ các file tĩnh
// Đường dẫn đến thư mục public
app.use(express.static(path.join(__dirname, '../../public')));
// Đường dẫn đến thư mục uploads
app.use(express.static(path.join(__dirname, '../../uploads')));
// Đường dẫn cụ thể cho avatars - thêm middleware xử lý cho cả hai định dạng
app.use('/avatars', express.static(path.join(__dirname, '../../../FE/public/avatars')));
// Middleware để xử lý yêu cầu default-avatar.png khi chỉ có default-avatar.svg
app.get('/avatars/default-avatar.png', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../FE/public/avatars/default-avatar.svg'));
});
// Xử lý đường dẫn admin/default-avatar.png
app.get('/admin/default-avatar.png', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../FE/public/avatars/default-avatar.svg'));
});

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Middleware để log tất cả request
app.use((req, res, next) => {
  console.log('==================================================');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers));
  
  if (req.method !== 'GET') {
    console.log('Body:', JSON.stringify(req.body));
  }
  
  // Ghi đè method response.send để log response
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[${new Date().toISOString()}] Response status: ${res.statusCode}`);
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.success === false) {
        console.log('Response error:', parsedData.message || 'Unknown error');
      } else {
        console.log('Response success:', parsedData.success);
      }
    } catch (e) {
      console.log('Response non-JSON');
    }
    console.log('==================================================');
    originalSend.call(this, data);
  };
  
  next();
});

// Routes - sửa route để phù hợp với yêu cầu từ Gateway
app.use('/api/dat-ban', thongTinDatBanRoutes);
app.use('/api/payment', paymentRoutes);

// Kiểm tra kết nối
app.get('/api/order/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Order Service',
    time: new Date().toISOString()
  });
});

// Middleware xử lý chuỗi QR code MoMo
app.get('*', (req, res, next) => {
  // Kiểm tra URL có phải là chuỗi QR code của MoMo hay không
  if (req.originalUrl.includes('00020101021226110007vn.momo')) {
    console.log('[QR HANDLER] Phát hiện yêu cầu QR code MoMo, đang xử lý...');
    console.log('[QR HANDLER] URL:', req.originalUrl);
    
    // Chuyển hướng về trang thanh toán của frontend
    const baseRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`[QR HANDLER] Chuyển hướng tới: ${baseRedirectUrl}/payment`);
    return res.redirect(`${baseRedirectUrl}/payment`);
  }
  
  // Nếu không phải QR code MoMo, tiếp tục với middleware tiếp theo
  next();
});

// Middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

// Kết nối đến MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    logger.info('Kết nối MongoDB thành công (Order Service)');
    
    // Khởi động server
    const PORT = config.servicePorts.order || 5004;
    server.listen(PORT, () => {
      logger.info(`Order Service đang chạy trên cổng ${PORT}`);
      logger.info(`Socket.IO đã được kích hoạt trên Order Service`);
    });
  })
  .catch((error) => {
    logger.error(`Lỗi kết nối MongoDB (Order Service): ${error.message}`);
    process.exit(1);
  }); 