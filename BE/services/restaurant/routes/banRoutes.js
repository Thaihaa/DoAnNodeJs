const express = require('express');
const router = express.Router();
const banController = require('../controllers/banController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate thông tin bàn
const validateBan = [
  body('maBan')
    .trim()
    .notEmpty()
    .withMessage('Mã bàn không được để trống'),
  body('viTri')
    .trim()
    .notEmpty()
    .withMessage('Vị trí bàn không được để trống'),
  body('soLuongKhachToiDa')
    .isInt({ min: 1 })
    .withMessage('Số lượng khách tối đa phải là số nguyên lớn hơn 0'),
  body('nhaHang')
    .notEmpty()
    .withMessage('Nhà hàng không được để trống')
];

// Middleware kiểm tra vai trò admin hoặc staff
const isStaffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối. Bạn cần quyền admin hoặc nhân viên!'
    });
  }
};

// Route công khai - không cần xác thực
router.get('/check-availability', banController.checkBanAvailability);

// Routes yêu cầu xác thực
router.get('/', authenticateToken, banController.getAllBan);
router.get('/:id', authenticateToken, banController.getBanById);

// Routes yêu cầu quyền admin hoặc nhân viên
router.post('/', authenticateToken, isStaffOrAdmin, validateBan, banController.createBan);
router.put('/:id', authenticateToken, isStaffOrAdmin, banController.updateBan);
router.delete('/:id', authenticateToken, isAdmin, banController.deleteBan);

module.exports = router; 