import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Cấu hình Axios đơn giản
const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  headers: { 
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Thêm token và xử lý headers cho multipart/form-data
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Không set Content-Type cho multipart/form-data, để axios tự xử lý
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Log request khi cần debug
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ''}${config.url || ''}`,
      headers: config.headers,
      data: config.data instanceof FormData ? '[FormData]' : config.data
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Xử lý lỗi cơ bản
api.interceptors.response.use(
  (response) => {
    // Log response khi cần debug
    console.log('API Response success:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    // Xử lý lỗi CORS, timeout hoặc network
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Network error hoặc timeout:', error.message);
      return Promise.reject({
        response: {
          data: {
            success: false,
            message: 'Lỗi kết nối đến server hoặc request quá thời gian. Vui lòng thử lại sau.'
          }
        }
      });
    }
    
    // Xử lý lỗi socket hang up
    if (error.message && error.message.includes('socket hang up')) {
      console.error('Socket hang up error:', error.message);
      return Promise.reject({
        response: {
          data: {
            success: false,
            message: 'Lỗi kết nối bị gián đoạn. Vui lòng thử lại sau.'
          }
        }
      });
    }
    
    console.error('API Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    // Xử lý lỗi xác thực 401
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 