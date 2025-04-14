const express = require('express');
const router = express.Router();
const danhGiaController = require('../controllers/danhGiaController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate đánh giá
const validateDanhGia = [
  body('diem')
    .isInt({ min: 1, max: 5 })
    .withMessage('Điểm đánh giá phải từ 1 đến 5'),
  body('noiDung')
    .trim()
    .notEmpty()
    .withMessage('Nội dung đánh giá không được để trống'),
  body('nhaHang')
    .notEmpty()
    .withMessage('Nhà hàng không được để trống')
];

// Validate trả lời
const validateTraLoi = [
  body('noiDung')
    .trim()
    .notEmpty()
    .withMessage('Nội dung trả lời không được để trống')
];

// Routes công khai
router.get('/', danhGiaController.getAllDanhGia);
router.get('/:id', danhGiaController.getDanhGiaById);

// Routes yêu cầu xác thực
router.post('/', authenticateToken, validateDanhGia, danhGiaController.createDanhGia);
router.put('/:id', authenticateToken, danhGiaController.updateDanhGia);
router.post('/:id/tra-loi', authenticateToken, validateTraLoi, danhGiaController.themTraLoiDanhGia);
router.delete('/:id', authenticateToken, danhGiaController.deleteDanhGia);

// Routes chỉ dành cho admin
router.patch('/:id/trang-thai', authenticateToken, isAdmin, danhGiaController.updateTrangThaiDanhGia);
router.patch('/:id/xac-thuc', authenticateToken, isAdmin, danhGiaController.xacThucDanhGia);

module.exports = router; 