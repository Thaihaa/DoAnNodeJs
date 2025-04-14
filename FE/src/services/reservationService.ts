import api from './api';
import { ApiResponse, Reservation, Ban } from '../types';

const RESERVATION_URL = '/dat-ban';

// Lấy danh sách đặt bàn
export const getAllReservations = async (page: number = 1, limit: number = 10) => {
  const response = await api.get<ApiResponse<Reservation[]>>(RESERVATION_URL, {
    params: { page, limit }
  });
  return response.data;
};

// Lấy thông tin đặt bàn theo ID
export const getReservationById = async (id: string) => {
  const response = await api.get<ApiResponse<Reservation>>(`${RESERVATION_URL}/${id}`);
  return response.data;
};

// Kiểm tra bàn có sẵn
export const checkAvailableBans = async (
  nhaHang: string,
  ngayDat: string,
  gioDat: string,
  soLuongKhach: number
) => {
  const response = await api.get<ApiResponse<{ availableBans: Ban[], count: number }>>(
    `${RESERVATION_URL}/check-available-bans`,
    {
      params: { nhaHang, ngayDat, gioDat, soLuongKhach }
    }
  );
  return response.data;
};

// Tạo đơn đặt bàn mới
export const createReservation = async (reservationData: Omit<Reservation, '_id' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<ApiResponse<Reservation>>(RESERVATION_URL, reservationData);
  return response.data;
};

// Cập nhật đặt bàn
export const updateReservation = async (id: string, reservationData: Partial<Reservation>) => {
  const response = await api.put<ApiResponse<Reservation>>(`${RESERVATION_URL}/${id}`, reservationData);
  return response.data;
};

// Cập nhật trạng thái đặt bàn
export const updateReservationStatus = async (id: string, trangThai: Reservation['trangThai']) => {
  const response = await api.patch<ApiResponse<Reservation>>(`${RESERVATION_URL}/${id}/trang-thai`, { trangThai });
  return response.data;
};

// Hủy đặt bàn
export const cancelReservation = async (id: string) => {
  const response = await api.patch<ApiResponse<Reservation>>(`${RESERVATION_URL}/${id}/trang-thai`, { trangThai: 'Đã hủy' });
  return response.data;
};

// Xóa đặt bàn (chỉ admin)
export const deleteReservation = async (id: string) => {
  const response = await api.delete<ApiResponse<null>>(`${RESERVATION_URL}/${id}`);
  return response.data;
}; 