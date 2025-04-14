const express = require('express');
const router = express.Router();
const thongTinDatBanController = require('../controllers/thongTinDatBanController');
const { authenticateToken, isAdmin } = require('../../../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validate đặt bàn
const validateThongTinDatBan = [
  body('hoTen')
    .trim()
    .notEmpty()
    .withMessage('Họ tên không được để trống'),
  body('soDienThoai')
    .trim()
    .notEmpty()
    .withMessage('Số điện thoại không được để trống'),
  body('nhaHang')
    .notEmpty()
    .withMessage('Nhà hàng không được để trống'),
  body('ngayDat')
    .notEmpty()
    .withMessage('Ngày đặt không được để trống')
    .custom(value => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    })
    .withMessage('Ngày đặt phải từ hôm nay trở đi'),
  body('gioDat')
    .trim()
    .notEmpty()
    .withMessage('Giờ đặt không được để trống'),
  body('soLuongKhach')
    .isInt({ min: 1 })
    .withMessage('Số lượng khách phải lớn hơn 0')
];

// Routes thống kê cho dashboard
router.get('/count', thongTinDatBanController.countThongTinDatBan);
router.get('/revenue', thongTinDatBanController.getTotalRevenue);
router.get('/recent', thongTinDatBanController.getRecentThongTinDatBan);

// Routes công khai
router.get('/check-available-bans', thongTinDatBanController.getAvailableBans);
// Cho phép đặt bàn không cần xác thực
router.post('/', validateThongTinDatBan, thongTinDatBanController.createThongTinDatBan);

// Routes yêu cầu xác thực
router.get('/', authenticateToken, thongTinDatBanController.getAllThongTinDatBan);
router.get('/:id', authenticateToken, thongTinDatBanController.getThongTinDatBanById);
router.put('/:id', authenticateToken, thongTinDatBanController.updateThongTinDatBan);
router.patch('/:id/trang-thai', authenticateToken, thongTinDatBanController.updateTrangThaiDatBan);
router.delete('/:id', authenticateToken, isAdmin, thongTinDatBanController.deleteThongTinDatBan);

module.exports = router; 