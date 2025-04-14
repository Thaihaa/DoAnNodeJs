import axios from 'axios';
import { API_URL } from '../config';
import { Ban, ApiResponse } from '../types';

const API_ENDPOINT = `${API_URL}/api/ban`;

// Lấy danh sách tất cả bàn
export const getAllBans = async (
  page = 1,
  limit = 10,
  nhaHang?: string,
  trangThai?: string,
  viTri?: string
): Promise<ApiResponse<Ban[]>> => {
  try {
    const params: any = { page, limit };
    if (nhaHang) params.nhaHang = nhaHang;
    if (trangThai) params.trangThai = trangThai;
    if (viTri) params.viTri = viTri;

    const response = await axios.get(API_ENDPOINT, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: 'Lỗi lấy danh sách bàn' };
  }
};

// Lấy thông tin chi tiết bàn
export const getBanById = async (id: string): Promise<ApiResponse<Ban>> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: 'Lỗi lấy thông tin bàn' };
  }
};

// Tạo bàn mới
export const createBan = async (banData: Partial<Ban>): Promise<ApiResponse<Ban>> => {
  try {
    const response = await axios.post(API_ENDPOINT, banData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: 'Lỗi tạo bàn mới' };
  }
};

// Cập nhật thông tin bàn
export const updateBan = async (id: string, banData: Partial<Ban>): Promise<ApiResponse<Ban>> => {
  try {
    const response = await axios.put(`${API_ENDPOINT}/${id}`, banData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: 'Lỗi cập nhật thông tin bàn' };
  }
};

// Xóa bàn
export const deleteBan = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.delete(`${API_ENDPOINT}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: 'Lỗi xóa bàn' };
  }
};

// Kiểm tra bàn có sẵn
export const checkBanAvailability = async (
  nhaHang: string,
  ngayDat: string,
  gioDat: string,
  soLuongKhach: number
): Promise<ApiResponse<{availableBans: Ban[], count: number}>> => {
  try {
    const params = { nhaHang, ngayDat, gioDat, soLuongKhach };
    const response = await axios.get(`${API_ENDPOINT}/check-availability`, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: 'Lỗi kiểm tra bàn có sẵn' };
  }
}; 