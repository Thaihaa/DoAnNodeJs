// Cấu hình cho tích hợp thanh toán MoMo
const dotenv = require('dotenv');
const path = require('path');

// Tải biến môi trường từ file .env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Kiểm tra môi trường và chọn endpoint phù hợp
const environment = process.env.MOMO_ENVIRONMENT || 'development';

// Kiểm tra thông tin từ biến môi trường
const validPartnerCode = process.env.MOMO_PARTNER_CODE && process.env.MOMO_PARTNER_CODE.trim();
const validAccessKey = process.env.MOMO_ACCESS_KEY && process.env.MOMO_ACCESS_KEY.trim();
const validSecretKey = process.env.MOMO_SECRET_KEY && process.env.MOMO_SECRET_KEY.trim();

// Log thông tin cấu hình
console.log(`Cấu hình MoMo - Môi trường: ${environment}`);
console.log(`Cấu hình MoMo - Partner Code: ${validPartnerCode ? 'Đã thiết lập' : 'CHƯA thiết lập'}`);
console.log(`Cấu hình MoMo - Access Key: ${validAccessKey ? 'Đã thiết lập' : 'CHƯA thiết lập'}`);
console.log(`Cấu hình MoMo - Secret Key: ${validSecretKey ? 'Đã thiết lập' : 'CHƯA thiết lập'}`);

// URL endpoint chuẩn cho môi trường test của MoMo
const TEST_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create';
const TEST_REFUND_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/refund';
const TEST_QUERY_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/query';

// URL endpoint cho môi trường production
const PROD_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/create';
const PROD_REFUND_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/refund';
const PROD_QUERY_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/query';

// API domain và frontend domain mặc định
const DEFAULT_API_DOMAIN = process.env.API_DOMAIN || 'http://localhost:5000';
const DEFAULT_FRONTEND_DOMAIN = process.env.FRONTEND_URL || 'http://localhost:3000';

module.exports = {
  // Thông tin kết nối MoMo
  partner: {
    partnerCode: validPartnerCode || 'MOMOBKUN20180529',
    accessKey: validAccessKey || 'klm05TvNBzhg7h7j',
    secretKey: validSecretKey || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa',
    environment: environment
  },
  
  // Cấu hình MoMo API dựa trên môi trường
  api: {
    endpoint: process.env.MOMO_API_ENDPOINT || (environment === 'production' ? PROD_ENDPOINT : TEST_ENDPOINT),
    refundEndpoint: process.env.MOMO_REFUND_ENDPOINT || (environment === 'production' ? PROD_REFUND_ENDPOINT : TEST_REFUND_ENDPOINT),
    queryEndpoint: process.env.MOMO_QUERY_ENDPOINT || (environment === 'production' ? PROD_QUERY_ENDPOINT : TEST_QUERY_ENDPOINT),
  },
  
  // Cấu hình ứng dụng - redirect và ipn URL
  app: {
    redirectUrl: process.env.MOMO_REDIRECT_URL || `${DEFAULT_API_DOMAIN}/api/payment/callback/momo`,
    ipnUrl: process.env.MOMO_IPN_URL || `${DEFAULT_API_DOMAIN}/api/payment/momo-ipn`,
    apiDomain: DEFAULT_API_DOMAIN,
    frontendDomain: DEFAULT_FRONTEND_DOMAIN
  }
}; 