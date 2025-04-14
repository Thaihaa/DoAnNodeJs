const dotenv = require('dotenv');
const path = require('path');

// Tải biến môi trường từ file .env
dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  servicePorts: {
    auth: process.env.AUTH_SERVICE_PORT || 5001,
    restaurant: process.env.RESTAURANT_SERVICE_PORT || 5002,
    menu: process.env.MENU_SERVICE_PORT || 5003,
    order: process.env.ORDER_SERVICE_PORT || 5004,
    review: process.env.REVIEW_SERVICE_PORT || 5005
  },
  serviceUrls: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    restaurant: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5002',
    menu: process.env.MENU_SERVICE_URL || 'http://localhost:5003',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:5004',
    review: process.env.REVIEW_SERVICE_URL || 'http://localhost:5005'
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  env: process.env.NODE_ENV || 'development'
}; 