const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const logger = require('../../utils/logger');
const config = require('../../config');

// Biến lưu trữ đối tượng gfs
let gfs, gridfsBucket;

// Kết nối đến MongoDB và thiết lập GridFS
const initGridFs = async () => {
  try {
    const connection = await mongoose.createConnection(config.mongodb.uri);
    gridfsBucket = new mongoose.mongo.GridFSBucket(connection.db, {
      bucketName: 'uploads'
    });
    
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection('uploads');
    
    logger.info('GridFS initialized successfully');
    return { gfs, connection, gridfsBucket };
  } catch (error) {
    logger.error(`Failed to initialize GridFS: ${error.message}`);
    throw error;
  }
};

// Controller upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được tải lên'
      });
    }
    
    logger.info(`File uploaded successfully: ${req.file.filename}`);
    
    // Tạo URL truy cập vào file
    const fileUrl = `${req.protocol}://${req.get('host')}/api/images/${req.file.filename}`;
    
    return res.status(200).json({
      success: true,
      message: 'Tải file lên thành công',
      file: req.file,
      url: fileUrl
    });
  } catch (error) {
    logger.error(`Upload file error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải file lên',
      error: error.message
    });
  }
};

// Controller lấy file
const getFile = async (req, res) => {
  try {
    if (!gridfsBucket) {
      const gridFsData = await initGridFs();
      gridfsBucket = gridFsData.gridfsBucket;
    }
    
    const filename = req.params.filename;
    
    // Tìm file theo tên
    const cursor = gridfsBucket.find({ filename });
    const filesArr = await cursor.toArray();
    
    if (filesArr.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy file'
      });
    }
    
    const file = filesArr[0];
    
    // Kiểm tra nếu file là hình ảnh
    const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.contentType);
    
    if (!isImage) {
      return res.status(400).json({
        success: false,
        message: 'File không phải là hình ảnh'
      });
    }
    
    // Thiết lập headers
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    
    // Stream file về client
    const downloadStream = gridfsBucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  } catch (error) {
    logger.error(`Get file error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy file',
      error: error.message
    });
  }
};

// Controller xóa file
const deleteFile = async (req, res) => {
  try {
    if (!gridfsBucket) {
      const gridFsData = await initGridFs();
      gridfsBucket = gridFsData.gridfsBucket;
    }
    
    const filename = req.params.filename;
    
    // Tìm file theo tên
    const cursor = gridfsBucket.find({ filename });
    const filesArr = await cursor.toArray();
    
    if (filesArr.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy file'
      });
    }
    
    // Xóa file theo ID
    await gridfsBucket.delete(filesArr[0]._id);
    
    return res.status(200).json({
      success: true,
      message: 'Đã xóa file thành công'
    });
  } catch (error) {
    logger.error(`Delete file error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa file',
      error: error.message
    });
  }
};

module.exports = {
  initGridFs,
  uploadFile,
  getFile,
  deleteFile
}; 