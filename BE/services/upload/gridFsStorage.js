const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const config = require('../../config');
const logger = require('../../utils/logger');

// Kết nối đến MongoDB
const connectToMongoDB = async () => {
  try {
    const conn = await mongoose.createConnection(config.mongodb.uri);
    logger.info('GridFS MongoDB connection established');
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB for GridFS: ${error.message}`);
    throw error;
  }
};

// Khởi tạo GridFS storage
const createStorage = async () => {
  // Tạo connection riêng cho GridFS
  const connection = await connectToMongoDB();
  
  // Thiết lập GridFS
  const storage = new GridFsStorage({
    db: connection,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        // Tạo tên file ngẫu nhiên để tránh trùng lặp
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            logger.error(`Error generating file name: ${err.message}`);
            return reject(err);
          }
          
          // Lấy phần mở rộng của file
          const fileExtension = path.extname(file.originalname).toLowerCase();
          
          // Kiểm tra phần mở rộng của file
          const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          if (!validExtensions.includes(fileExtension)) {
            return reject(new Error('Định dạng file không được hỗ trợ. Chỉ hỗ trợ: JPG, PNG, GIF, WEBP'));
          }
          
          // Tạo tên file
          const filename = `img_${buf.toString('hex')}${fileExtension}`;
          
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
            metadata: {
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              uploadedAt: new Date()
            }
          };
          
          resolve(fileInfo);
        });
      });
    }
  });
  
  return { connection, storage };
};

module.exports = { createStorage }; 