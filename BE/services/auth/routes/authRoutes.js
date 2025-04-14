const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate đăng ký
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Tên đăng nhập phải có ít nhất 3 ký tự'),
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Họ tên không được để trống')
];

// Validate đăng nhập
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Tên đăng nhập không được để trống'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
];

// Routes
router.post('/register', validateRegister, authController.register);
router.post('/admin-register', authenticateToken, isAdmin, validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/current', authenticateToken, authController.getCurrentUser);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router; 