const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate vai trò
const validateRole = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên vai trò không được để trống')
    .isLength({ min: 3, max: 50 })
    .withMessage('Tên vai trò phải từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên vai trò chỉ được chứa chữ cái, số và dấu gạch dưới'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Danh sách quyền phải là mảng')
];

// Routes chỉ cho Admin
router.get('/', authenticateToken, isAdmin, roleController.getAllRoles);
router.get('/:id', authenticateToken, isAdmin, roleController.getRoleById);
router.post('/', authenticateToken, isAdmin, validateRole, roleController.createRole);
router.put('/:id', authenticateToken, isAdmin, roleController.updateRole);
router.delete('/:id', authenticateToken, isAdmin, roleController.deleteRole);

module.exports = router; 