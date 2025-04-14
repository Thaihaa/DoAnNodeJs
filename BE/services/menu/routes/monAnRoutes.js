const express = require('express');
const router = express.Router();
const monAnController = require('../controllers/monAnController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate món ăn
const validateMonAn = [
  body('tenMon')
    .trim()
    .notEmpty()
    .withMessage('Tên món ăn không được để trống'),
  body('gia')
    .isNumeric()
    .withMessage('Giá phải là số')
    .custom(value => value >= 0)
    .withMessage('Giá không được âm'),
  body('loaiMonAn')
    .notEmpty()
    .withMessage('Loại món ăn không được để trống')
];

// Routes công khai
router.get('/', monAnController.getAllMonAn);
router.get('/popular', monAnController.getPopularMonAn);
router.get('/noi-bat', monAnController.getMonAnNoiBat);
router.get('/:id', monAnController.getMonAnById);

// Routes yêu cầu xác thực
router.post('/', authenticateToken, validateMonAn, monAnController.createMonAn);
router.put('/:id', authenticateToken, monAnController.updateMonAn);

// Route xóa tất cả - đặt trước route xóa theo ID để tránh bị nhầm lẫn
router.delete('/delete-all', authenticateToken, isAdmin, monAnController.deleteAllMonAn);

// Route xóa theo ID
router.delete('/:id', authenticateToken, isAdmin, monAnController.deleteMonAn);

module.exports = router; 