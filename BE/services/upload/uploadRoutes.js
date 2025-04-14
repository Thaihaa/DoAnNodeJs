const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createStorage } = require('./gridFsStorage');
const uploadController = require('./uploadController');
const { authenticateToken } = require('../../middlewares/authMiddleware');
const logger = require('../../utils/logger');

// Khởi tạo storage và upload middleware
let upload;

const initMulter = async () => {
  try {
    const { storage } = await createStorage();
    upload = multer({ 
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        // Kiểm tra MIME type
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Định dạng file không được hỗ trợ. Chỉ hỗ trợ: JPG, PNG, GIF, WEBP'), false);
        }
      }
    });
    logger.info('Multer initialized with GridFS storage');
    return upload;
  } catch (error) {
    logger.error(`Error initializing multer: ${error.message}`);
    throw error;
  }
};

// Middleware để đảm bảo upload đã được khởi tạo
const ensureUploadInitialized = async (req, res, next) => {
  try {
    if (!upload) {
      await initMulter();
    }
    next();
  } catch (error) {
    logger.error(`Error in ensureUploadInitialized: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khởi tạo hệ thống upload',
      error: error.message
    });
  }
};

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Giới hạn 10MB.'
      });
    }
    logger.error(`Multer error: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: `Lỗi upload: ${err.message}`
    });
  } else if (err) {
    logger.error(`Upload error: ${err.message}`);
    return res.status(400).json({
      success: false, 
      message: err.message
    });
  }
  next();
};

// Khởi tạo GridFS khi khởi động server
uploadController.initGridFs().catch(err => {
  logger.error(`Failed to initialize GridFS on startup: ${err.message}`);
});

// Route upload file
router.post(
  '/upload',
  authenticateToken,
  ensureUploadInitialized,
  async (req, res, next) => {
    try {
      logger.info('Handling upload request');
      if (!upload) {
        throw new Error('Upload middleware not initialized');
      }
      upload.single('image')(req, res, function(err) {
        if (err) {
          return handleUploadError(err, req, res, next);
        }
        next();
      });
    } catch (error) {
      logger.error(`Error in upload route: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Lỗi xử lý upload',
        error: error.message
      });
    }
  },
  uploadController.uploadFile
);

// Route lấy file
router.get('/images/:filename', uploadController.getFile);

// Route xóa file (yêu cầu xác thực)
router.delete('/images/:filename', authenticateToken, uploadController.deleteFile);

module.exports = router; 