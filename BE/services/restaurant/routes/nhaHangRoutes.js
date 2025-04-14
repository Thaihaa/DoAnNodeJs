const express = require('express');
const router = express.Router();
const nhaHangController = require('../controllers/nhaHangController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate tạo nhà hàng
const validateNhaHang = [
  body('tenNhaHang')
    .trim()
    .notEmpty()
    .withMessage('Tên nhà hàng không được để trống'),
  body('diaChi')
    .trim()
    .notEmpty()
    .withMessage('Địa chỉ không được để trống'),
  body('dienThoai')
    .trim()
    .notEmpty()
    .withMessage('Số điện thoại không được để trống'),
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('gioMoCua')
    .trim()
    .notEmpty()
    .withMessage('Giờ mở cửa không được để trống'),
  body('gioDongCua')
    .trim()
    .notEmpty()
    .withMessage('Giờ đóng cửa không được để trống')
];

// Route đếm số lượng nhà hàng
router.get('/count', nhaHangController.countNhaHang);

// Routes công khai
router.get('/', nhaHangController.getAllNhaHang);
router.get('/gan-day', nhaHangController.getNhaHangGanDay);
router.get('/:id', nhaHangController.getNhaHangById);

// Routes yêu cầu xác thực
router.post('/', authenticateToken, isAdmin, validateNhaHang, nhaHangController.createNhaHang);
router.put('/:id', authenticateToken, isAdmin, nhaHangController.updateNhaHang);
router.delete('/:id', authenticateToken, isAdmin, nhaHangController.deleteNhaHang);

module.exports = router; 