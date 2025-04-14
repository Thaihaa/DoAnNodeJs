const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../../../middlewares/authMiddleware');

// Route để debug - liệt kê các routes của router
router.get('/routes', (req, res) => {
  const routes = [];
  router.stack.forEach(layer => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
      routes.push({ path, methods });
    }
  });
  
  res.status(200).json({
    success: true,
    routes: routes
  });
});

// Route hoàn tiền MoMo - đặt trước route có param để tránh xung đột
router.post('/refund/momo', authenticateToken, paymentController.refundMomoPayment);

// Route tạo thanh toán MoMo cho đặt bàn
router.post('/momo/:datBanId', paymentController.createMomoPayment);

// Route callback cho MoMo (public - không yêu cầu xác thực)
router.get('/callback/momo', paymentController.handleMomoCallback);

// Route IPN cho MoMo (public - không yêu cầu xác thực)
router.post('/momo-ipn', paymentController.handleMomoIPN);

// Route kiểm tra trạng thái thanh toán - có xác thực
router.get('/check/:orderId', authenticateToken, paymentController.checkPaymentStatus);

// Route kiểm tra trạng thái thanh toán - public (cho client sử dụng)
router.get('/status/:orderId', paymentController.checkPaymentStatus);

// Route để xử lý các yêu cầu QR code MoMo (giải quyết lỗi không tìm thấy URL)
router.get('/qr-redirect', (req, res) => {
  console.log(`Xử lý redirect QR code: ${req.originalUrl}`);
  
  // Trích xuất orderId từ URL (nếu có)
  const url = req.originalUrl;
  const orderIdMatch = url.match(/datBanId%22%3A%22([^%]+)%22/);
  const orderId = orderIdMatch ? orderIdMatch[1] : null;
  
  // Chuyển hướng về trang chi tiết đặt bàn nếu có orderId, ngược lại về trang payment
  const baseRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const redirectUrl = orderId 
    ? `${baseRedirectUrl}/booking/${orderId}`
    : `${baseRedirectUrl}/payment`;
    
  console.log(`Chuyển hướng tới: ${redirectUrl}`);
  return res.redirect(redirectUrl);
});

// Route để xử lý các yêu cầu lạ từ client MoMo (giải quyết lỗi không tìm thấy URL)
router.get('*', (req, res) => {
  console.log(`Nhận yêu cầu không khớp với route được định nghĩa: ${req.originalUrl}`);
  // Kiểm tra xem URL có phải QR code của MoMo
  if (req.originalUrl.includes('00020101021226110007vn.momo')) {
    console.log('Phát hiện yêu cầu QR code MoMo, chuyển hướng về trang thanh toán');
    
    // Trích xuất orderId từ URL (nếu có)
    const url = req.originalUrl;
    const orderIdMatch = url.match(/datBanId%22%3A%22([^%]+)%22/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;
    
    // Chuyển hướng về trang chi tiết đặt bàn nếu có orderId, ngược lại về trang payment
    const baseRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = orderId 
      ? `${baseRedirectUrl}/booking/${orderId}`
      : `${baseRedirectUrl}/payment`;
      
    console.log(`Chuyển hướng tới: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  }
  
  // Trả về lỗi 404 cho các yêu cầu khác
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy đường dẫn yêu cầu',
    requestedPath: req.originalUrl
  });
});

module.exports = router; 