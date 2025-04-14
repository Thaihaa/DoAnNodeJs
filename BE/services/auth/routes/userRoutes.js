const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate cập nhật thông tin
const validateUpdateUser = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Họ tên không được để trống nếu cung cấp'),
  body('phoneNumber')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim()
];

// Validate đổi mật khẩu
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
];

// Routes

// Route đếm số lượng người dùng (đặt ở đầu để tránh xung đột với các route khác)
router.get('/count', userController.countUsers);

// Routes cho admin
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.post('/set-role', authenticateToken, isAdmin, userController.setUserRole);
router.post('/create-admin', authenticateToken, isAdmin, userController.createAdmin);
router.patch('/:id/status', authenticateToken, isAdmin, userController.toggleUserStatus);
router.patch('/:id/role', authenticateToken, isAdmin, userController.updateRole);
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);

// Routes cho người dùng cụ thể (đặt trước các route có pattern dùng :id)
router.get('/me', authenticateToken, userController.getUserById);
router.put('/me', authenticateToken, validateUpdateUser, userController.updateUser);
router.patch('/me/password', authenticateToken, validateChangePassword, userController.changePassword);

// Routes cho người dùng theo ID
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, validateUpdateUser, userController.updateUser);
router.patch('/:id/password', authenticateToken, validateChangePassword, userController.changePassword);

module.exports = router; 