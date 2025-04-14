const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = require('node-fetch');
const config = require('./config');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  try {
    // Lấy token từ headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực'
      });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`Lỗi xác thực token: ${error.message}`);
    return res.status(403).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      error: error.message
    });
  }
};

// Tải biến môi trường
dotenv.config();

// Khởi tạo app
const app = express();

// Thiết lập middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: config.cors.origin || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
  contentSecurityPolicy: false
}));

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Middleware Proxy cho các service
// Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.auth}`,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' },
  timeout: 60000,
  proxyTimeout: 60000,
  onError: (err, req, res) => {
    logger.error(`Proxy error (Auth): ${err.message}`);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Lỗi kết nối dịch vụ xác thực, vui lòng thử lại sau'
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực 
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }

    if (req.body && req.method === 'POST') {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
}));

app.use('/api/users', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.auth}`,
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  ws: false,
  secure: false,
  followRedirects: false,
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // Xử lý body cho các request POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const contentType = proxyReq.getHeader('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // Ghi lại body vào request
        proxyReq.write(bodyData);
      }
    }
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error (Users): ${err.message}`);
    
    // Xử lý lỗi socket hang up
    if (err.code === 'ECONNRESET' || err.message.includes('socket hang up')) {
      logger.error(`ECONNRESET hoặc socket hang up trong request: ${req.method} ${req.path}`);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Kết nối bị gián đoạn, vui lòng thử lại sau',
          error: 'ECONNRESET'
        });
      }
    }
    
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        success: false,
        message: 'Lỗi kết nối dịch vụ, vui lòng thử lại sau',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }));
    }
  }
}));

// Roles Service
app.use('/api/roles', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.auth}`,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  ws: false,
  secure: false,
  followRedirects: false,
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error (Roles): ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        success: false,
        message: 'Lỗi kết nối dịch vụ vai trò, vui lòng thử lại sau',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }));
    }
  }
}));

// Restaurant Service
app.use('/api/nha-hang', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.restaurant}`,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  }
}));

// Bàn Service
app.use('/api/ban', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.restaurant}`,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  }
}));

// Menu Service
app.use('/api/loai-mon-an', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.menu}`,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  }
}));

app.use('/api/mon-an', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.menu}`,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // Xử lý dữ liệu POST
    if (req.method === 'POST' && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error (Menu Service): ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Lỗi kết nối đến dịch vụ thực đơn',
        error: err.message
      });
    }
  }
}));

// Order Service
app.use('/api/order', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.order}`,
  changeOrigin: true,
  pathRewrite: { '^/api/order': '/api' },
  timeout: 30000,
  proxyTimeout: 30000,
  ws: false,
  secure: false,
  followRedirects: false,
  onError: (err, req, res) => {
    logger.error(`Proxy error (Order Service): ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        success: false,
        message: 'Lỗi kết nối dịch vụ đặt bàn, vui lòng thử lại sau',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }));
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    if (req.method === 'POST') {
      console.log('Gateway API receiving POST to /api/order');
      console.log('Req body:', req.body);
      
      // Nếu body là JSON, chuyển đổi nó sang đúng định dạng
      if (req.body && typeof req.body === 'object') {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    }
  }
}));

// Payment Service - thêm cấu hình đặc biệt cho API thanh toán
app.use('/api/payment', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.order}`,
  changeOrigin: true,
  pathRewrite: { '^/api/payment': '/api/payment' },
  timeout: 60000,
  proxyTimeout: 60000,
  ws: false,
  secure: false,
  followRedirects: true,
  onError: (err, req, res) => {
    logger.error(`Proxy error (Payment Service): ${err.message}`);
    console.error(`Detailed Payment Error: ${err.stack}`);
    
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        success: false,
        message: 'Lỗi kết nối dịch vụ thanh toán, vui lòng thử lại sau',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }));
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PAYMENT GATEWAY] Forwarding ${req.method} ${req.url} to Order service`);
    console.log(`[PAYMENT GATEWAY] Original URL: ${req.originalUrl}`);
    
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log(`[PAYMENT GATEWAY] Authorization header forwarded`);
    }
    
    // Xử lý dữ liệu POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      console.log(`[PAYMENT GATEWAY] Request body:`, req.body);
      
      // Nếu body là JSON, chuyển đổi nó sang đúng định dạng
      if (req.body && typeof req.body === 'object') {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        console.log(`[PAYMENT GATEWAY] JSON body forwarded, length: ${Buffer.byteLength(bodyData)}`);
      }
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PAYMENT GATEWAY] Received response from Order service: ${proxyRes.statusCode}`);
    
    // Log response để debug
    let responseBody = '';
    proxyRes.on('data', function (chunk) {
      responseBody += chunk;
    });
    
    proxyRes.on('end', function () {
      try {
        const jsonBody = JSON.parse(responseBody);
        console.log(`[PAYMENT GATEWAY] Response body:`, jsonBody);
      } catch (e) {
        console.log(`[PAYMENT GATEWAY] Non-JSON response body`);
      }
    });
  }
}));

// Bảo lưu route cũ để tương thích ngược
app.use('/api/dat-ban', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.order}`,
  changeOrigin: true,
  pathRewrite: { '^/api/dat-ban': '/api/dat-ban' },
  timeout: 30000,
  proxyTimeout: 30000,
  ws: false,
  secure: false,
  followRedirects: false,
  onError: (err, req, res) => {
    logger.error(`Proxy error (Order - Đặt bàn): ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        success: false,
        message: 'Lỗi kết nối dịch vụ đặt bàn, vui lòng thử lại sau',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }));
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    if (req.method === 'POST') {
      console.log('Gateway API receiving POST to /api/dat-ban');
      console.log('Req body:', req.body);
      
      // Nếu body là JSON, chuyển đổi nó sang đúng định dạng
      if (req.body && typeof req.body === 'object') {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    }
  }
}));

// Review Service
app.use('/api/danh-gia', createProxyMiddleware({
  target: `http://localhost:${config.servicePorts.review}`,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Chuyển tiếp token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'API Gateway',
    time: new Date().toISOString(),
    message: 'API Gateway đang hoạt động bình thường'
  });
});

// API Dashboard Admin
app.get('/api/admin/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền Admin
    if (req.user.role !== 'admin') {
      console.log('Người dùng không có quyền admin:', req.user);
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    console.log('User đã xác thực:', req.user);

    // Lấy token từ request
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // Headers cho các request nội bộ
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Lấy tổng số người dùng
    const usersResponse = await fetch(`http://localhost:${config.servicePorts.auth}/api/users/count`, {
      headers
    });
    const usersData = await usersResponse.json();
    console.log('User data:', usersData);

    // Lấy tổng số đơn đặt bàn
    const reservationsResponse = await fetch(`http://localhost:${config.servicePorts.order}/api/dat-ban/count`, {
      headers
    });
    const reservationsData = await reservationsResponse.json();
    console.log('Reservation data:', reservationsData);

    // Lấy tổng doanh thu
    const revenueResponse = await fetch(`http://localhost:${config.servicePorts.order}/api/dat-ban/revenue`, {
      headers
    });
    const revenueData = await revenueResponse.json();
    console.log('Revenue data:', revenueData);

    // Lấy tổng số nhà hàng
    const restaurantsResponse = await fetch(`http://localhost:${config.servicePorts.restaurant}/api/nha-hang/count`, {
      headers
    });
    const restaurantsData = await restaurantsResponse.json();
    console.log('Restaurant data:', restaurantsData);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: usersData.success ? usersData.count : 0,
        userIncrease: '+0%',
        totalOrders: reservationsData.success ? reservationsData.count : 0,
        orderIncrease: '+0%',
        totalReservations: reservationsData.success ? reservationsData.count : 0,
        reservationIncrease: '+0%',
        totalRevenue: revenueData.success ? revenueData.totalRevenue : 0,
        revenueIncrease: '+0%',
        totalRestaurants: restaurantsData.success ? restaurantsData.count : 0
      }
    });
  } catch (error) {
    console.error(`Lỗi lấy thống kê dashboard:`, error);
    logger.error(`Lỗi lấy thống kê dashboard: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê dashboard',
      error: error.message
    });
  }
});

// API lấy đơn hàng gần đây
app.get('/api/admin/dashboard/recent-orders', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    // Lấy token từ request
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // Lấy danh sách đơn đặt bàn gần đây
    const response = await fetch(`http://localhost:${config.servicePorts.order}/api/dat-ban/recent?limit=4`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi lấy đơn hàng gần đây'
      });
    }

    // Format dữ liệu đơn hàng
    const formattedOrders = data.data.map(order => ({
      id: `ORD-${order._id.substring(0, 4)}`,
      customer: order.hoTen || 'Khách hàng',
      time: new Date(order.createdAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      total: `${order.tongTien.toLocaleString('vi-VN')}đ`,
      status: order.trangThai === 'Hoàn thành' ? 'Hoàn thành' : 
              order.trangThai === 'Đã xác nhận' ? 'Đang xử lý' : 
              'Chờ thanh toán'
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    logger.error(`Lỗi lấy đơn hàng gần đây: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy đơn hàng gần đây',
      error: error.message
    });
  }
});

// API lấy đặt bàn gần đây
app.get('/api/admin/dashboard/recent-reservations', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    // Lấy token từ request
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // Lấy danh sách đặt bàn gần đây
    const response = await fetch(`http://localhost:${config.servicePorts.order}/api/dat-ban/recent?limit=4&sort=ngayDat`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi lấy đặt bàn gần đây'
      });
    }

    // Format dữ liệu đặt bàn
    const formattedReservations = data.data.map(reservation => ({
      id: `RES-${reservation._id.substring(0, 4)}`,
      customer: reservation.hoTen || 'Khách hàng',
      time: new Date(reservation.ngayDat).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: new Date(reservation.ngayDat).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      guests: reservation.soLuongKhach,
      status: reservation.trangThai === 'Hoàn thành' ? 'Xác nhận' : 
              reservation.trangThai === 'Đã xác nhận' ? 'Xác nhận' : 
              reservation.trangThai === 'Đã hủy' ? 'Hủy' : 
              'Chờ xác nhận'
    }));

    res.status(200).json({
      success: true,
      data: formattedReservations
    });
  } catch (error) {
    logger.error(`Lỗi lấy đặt bàn gần đây: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy đặt bàn gần đây',
      error: error.message
    });
  }
});

// API lấy món ăn phổ biến
app.get('/api/admin/dashboard/popular-items', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    // Lấy token từ request
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // Lấy danh sách món ăn phổ biến
    const response = await fetch(`http://localhost:${config.servicePorts.menu}/api/mon-an/popular`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi lấy món ăn phổ biến'
      });
    }

    // Tính phần trăm dựa trên món phổ biến nhất
    let maxCount = 0;
    data.data.forEach(item => {
      if (item.count > maxCount) maxCount = item.count;
    });

    // Format dữ liệu món ăn phổ biến
    const formattedItems = data.data.map(item => ({
      name: item.tenMon,
      count: item.count,
      percent: maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0
    }));

    res.status(200).json({
      success: true,
      data: formattedItems
    });
  } catch (error) {
    logger.error(`Lỗi lấy món ăn phổ biến: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy món ăn phổ biến',
      error: error.message
    });
  }
});

// Kiểm tra kết nối đến Auth Service
app.get('/api/auth-check', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:${config.servicePorts.auth}/api/auth/health`);
    const data = await response.json();
    res.status(200).json({
      success: true,
      message: 'Auth Service hoạt động bình thường',
      serviceResponse: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể kết nối đến Auth Service',
      error: error.message
    });
  }
});

// API kiểm tra vai trò Admin
app.get('/api/check-admin', async (req, res) => {
  try {
    // Lấy token từ headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực'
      });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwt.secret);
    
    // Truy vấn thông tin người dùng từ Auth Service
    const response = await fetch(`http://localhost:${config.servicePorts.auth}/api/auth/current`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ hoặc người dùng không tồn tại'
      });
    }
    
    const userData = await response.json();
    
    // Kiểm tra vai trò
    if (userData.user && userData.user.role === 'admin') {
      return res.status(200).json({
        success: true,
        isAdmin: true,
        message: 'Người dùng có quyền Admin'
      });
    } else {
      return res.status(403).json({
        success: false,
        isAdmin: false,
        message: 'Người dùng không có quyền Admin'
      });
    }
  } catch (error) {
    console.error('Lỗi kiểm tra quyền Admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi kiểm tra quyền Admin',
      error: error.message
    });
  }
});

// Tạo tài khoản Admin đầu tiên
app.post('/api/create-first-admin', async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Tính năng này đã bị vô hiệu hóa'
  });
});

// Middleware xử lý chuỗi QR code MoMo
app.get('*', (req, res, next) => {
  // Kiểm tra URL có phải là chuỗi QR code của MoMo hay không
  if (req.originalUrl.includes('00020101021226110007vn.momo')) {
    console.log('[GATEWAY QR HANDLER] Phát hiện yêu cầu QR code MoMo, đang xử lý...');
    console.log('[GATEWAY QR HANDLER] URL:', req.originalUrl);
    
    // Trích xuất orderId từ URL (nếu có)
    const url = req.originalUrl;
    const orderIdMatch = url.match(/datBanId%22%3A%22([^%]+)%22/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;
    
    // Chuyển hướng về trang chi tiết đặt bàn nếu có orderId, ngược lại về trang payment
    const baseRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = orderId 
      ? `${baseRedirectUrl}/booking/${orderId}`
      : `${baseRedirectUrl}/payment`;
      
    console.log(`[GATEWAY QR HANDLER] Chuyển hướng tới: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  }
  
  // Nếu không phải QR code MoMo, tiếp tục với middleware tiếp theo
  next();
});

// Middleware xử lý lỗi cho các route không được tìm thấy
app.use(notFound);
app.use(errorHandler);

// Khởi động server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  logger.info(`API Gateway đang chạy trên cổng ${PORT}`);
  logger.info(`Môi trường: ${config.env}`);
}); 