const express = require('express');
const router = express.Router();
const loaiMonAnController = require('../controllers/loaiMonAnController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate loại món ăn
const validateLoaiMonAn = [
  body('tenLoai')
    .trim()
    .notEmpty()
    .withMessage('Tên loại món ăn không được để trống')
];

// Routes công khai
router.get('/', loaiMonAnController.getAllLoaiMonAn);
router.get('/:id', loaiMonAnController.getLoaiMonAnById);

// Routes yêu cầu xác thực
router.post('/', authenticateToken, isAdmin, validateLoaiMonAn, loaiMonAnController.createLoaiMonAn);
router.put('/:id', authenticateToken, isAdmin, loaiMonAnController.updateLoaiMonAn);

// Route xóa tất cả - đặt trước route xóa theo ID
router.delete('/delete-all', authenticateToken, isAdmin, loaiMonAnController.deleteAllLoaiMonAn);

// Route xóa theo ID
router.delete('/:id', authenticateToken, isAdmin, loaiMonAnController.deleteLoaiMonAn);

module.exports = router; 