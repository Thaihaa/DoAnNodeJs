import api from './api';
import { AxiosResponse } from 'axios';

// Interfaces cho thanh toán
export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    paymentId: string;
    payUrl: string;
    deeplink: string;
    qrCodeUrl: string;
    orderId: string;
  };
  error?: any;
}

export interface PaymentStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    trangThai: 'pending' | 'success' | 'failed' | 'cancelled';
    ngayThanhToan?: string;
    momoResponse?: any;
  };
  error?: any;
}

/**
 * Gọi API tạo thanh toán MoMo cho đặt bàn
 * @param datBanId ID của đặt bàn cần thanh toán
 * @returns Thông tin thanh toán từ MoMo
 */
export const createMomoPayment = async (datBanId: string): Promise<PaymentResponse> => {
  try {
    console.log('paymentService - Bắt đầu gọi API tạo thanh toán MoMo cho datBanId:', datBanId);
    
    // Kiểm tra ID hợp lệ
    if (!datBanId || datBanId.trim() === '') {
      console.error('paymentService - ID đặt bàn không hợp lệ:', datBanId);
      throw new Error('ID đặt bàn không hợp lệ');
    }
    
    // Kiểm tra định dạng MongoDB ObjectId
    if (!datBanId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('paymentService - ID đặt bàn không đúng định dạng MongoDB ObjectId:', datBanId);
      throw new Error('ID đặt bàn không đúng định dạng (cần 24 ký tự hexadecimal)');
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('paymentService - Không tìm thấy token xác thực');
      throw new Error('Bạn cần đăng nhập để thực hiện thanh toán');
    }
    
    console.log('paymentService - URL gọi API:', `/payment/momo/${datBanId}`);
    
    try {
      const response: AxiosResponse<PaymentResponse> = await api.post(
        `/payment/momo/${datBanId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('paymentService - Kết quả từ API:', response.data);
      return response.data;
    } catch (apiError: any) {
      console.error('paymentService - Lỗi API:', apiError);
      
      if (apiError.response) {
        console.error('paymentService - Mã lỗi HTTP:', apiError.response.status);
        console.error('paymentService - Response data:', apiError.response.data);
        
        // Định dạng lỗi rõ ràng hơn
        throw apiError.response.data || {
          success: false,
          message: apiError.response.data?.message || `Lỗi ${apiError.response.status}: ${apiError.message}`
        };
      }
      
      // Nếu không có response, có thể là lỗi mạng
      throw {
        success: false,
        message: apiError.message || 'Lỗi kết nối tới server'
      };
    }
  } catch (error: any) {
    console.error('paymentService - Lỗi khi tạo thanh toán MoMo:', error);
    
    // Đảm bảo luôn trả về dạng lỗi chuẩn
    throw (typeof error === 'object' && error !== null) 
      ? error 
      : {
          success: false,
          message: typeof error === 'string' ? error : 'Đã xảy ra lỗi khi tạo thanh toán MoMo'
        };
  }
};

/**
 * Kiểm tra trạng thái thanh toán
 * @param orderId ID của đơn hàng thanh toán
 * @returns Thông tin trạng thái thanh toán
 */
export const checkPaymentStatus = async (orderId: string): Promise<PaymentStatusResponse> => {
  try {
    const response: AxiosResponse<PaymentStatusResponse> = await api.get(
      `/payment/check/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
    throw error.response?.data || {
      success: false,
      message: 'Đã xảy ra lỗi khi kiểm tra trạng thái thanh toán'
    };
  }
};

/**
 * Gọi API hoàn tiền MoMo
 * @param orderId ID của đơn hàng cần hoàn tiền
 * @param transId ID giao dịch MoMo
 * @param amount Số tiền cần hoàn
 * @returns Kết quả hoàn tiền từ MoMo
 */
export const refundMomoPayment = async (
  orderId: string,
  transId: string,
  amount: number
): Promise<RefundResponse> => {
  try {
    console.log('paymentService - Bắt đầu gọi API hoàn tiền MoMo:', { orderId, transId, amount });
    
    // Kiểm tra tham số đầu vào
    if (!orderId || orderId.trim() === '') {
      throw new Error('ID đơn hàng không được để trống');
    }
    
    if (!transId || transId.trim() === '') {
      throw new Error('ID giao dịch MoMo không được để trống');
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Số tiền hoàn phải lớn hơn 0');
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Bạn cần đăng nhập để thực hiện hoàn tiền');
    }
    
    const response: AxiosResponse<RefundResponse> = await api.post(
      '/payment/momo/refund',
      { orderId, transId, amount },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('paymentService - Kết quả hoàn tiền từ API:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('paymentService - Lỗi khi hoàn tiền MoMo:', error);
    
    // Định dạng lỗi trả về cho frontend
    if (error.response) {
      console.error('paymentService - Mã lỗi HTTP:', error.response.status);
      console.error('paymentService - Response data:', error.response.data);
      
      throw error.response.data || {
        success: false,
        message: error.response.data?.message || `Lỗi ${error.response.status}: ${error.message}`
      };
    }
    
    throw {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi hoàn tiền MoMo'
    };
  }
};

// Thêm kiểu dữ liệu cho kết quả hoàn tiền
export interface RefundResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    transId: string;
    amount: number;
    resultCode: number;
    refundTrans?: string;
  };
} 