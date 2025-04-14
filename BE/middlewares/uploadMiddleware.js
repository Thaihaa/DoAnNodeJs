const multer = require('multer');
const path = require('path');
const fs = require('fs');
const responseHandler = require('../utils/responseHandler');

// Tạo thư mục uploads nếu chưa tồn tại
const createUploadDir = (dir) => {
  const uploadPath = path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads', dir);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Cấu hình nơi lưu trữ ảnh tải lên
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Lọc file - chỉ cho phép hình ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  }
});

// Middleware kiểm tra lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Giới hạn 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Lỗi upload: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Xuất middleware tải lên một file
const uploadSingle = (fieldName) => [upload.single(fieldName), handleUploadError];

// Xuất middleware tải lên nhiều file
const uploadMultiple = (fieldName, maxCount = 5) => [upload.array(fieldName, maxCount), handleUploadError];

module.exports = {
  uploadSingle,
  uploadMultiple
}; 