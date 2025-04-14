import api from './api';
import { AuthResponse, User } from '../types';

// Đăng ký tài khoản mới
export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
}) => {
  const response = await api.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

// Đăng nhập
export const login = async (username: string, password: string) => {
  const response = await api.post<AuthResponse>('/auth/login', { username, password });
  
  if (response.data.success && response.data.token) {
    // Lưu token và thông tin user vào localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Đăng xuất
export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  const response = await api.get<AuthResponse>('/auth/current');
  return response.data;
};

// Kiểm tra trạng thái đăng nhập
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Lấy thông tin user từ localStorage
export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Lỗi khi parse thông tin user:', error);
    return null;
  }
};

// Làm mới token
export const refreshToken = async (refreshToken: string) => {
  const response = await api.post<AuthResponse>('/auth/refresh-token', { refreshToken });
  
  if (response.data.success && response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
}; 