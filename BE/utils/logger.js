const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Tạo thư mục logs nếu chưa tồn tại
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Định nghĩa các mức độ log và màu sắc tương ứng
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Chọn level dựa trên môi trường
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// Định dạng cho các logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Định dạng màu sắc cho console
const colorFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Định nghĩa các transports (nơi để ghi logs)
const transports = [
  // Ghi tất cả log vào console
  new winston.transports.Console({
    format: colorFormat,
  }),
  // Ghi tất cả log vào file error.log
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
  }),
  // Ghi tất cả logs vào file combined.log
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
  }),
];

// Tạo instance của logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = logger; 