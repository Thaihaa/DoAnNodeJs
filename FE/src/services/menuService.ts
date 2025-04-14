import api from './api';

// Interface cho Món ăn
export interface MonAn {
  _id?: string;
  tenMon: string;
  moTa?: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh?: string[];
  nguyenLieu?: string;
  loaiMonAn: string;
  nhaHang: string;
  trangThai?: boolean;
  noiBat?: boolean;
  danhGiaTrungBinh?: number;
  soLuongDanhGia?: number;
  thuTu?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interface cho Loại món ăn
export interface LoaiMonAn {
  _id?: string;
  tenLoai: string;
  moTa?: string;
  hinhAnh?: string;
  thuTu?: number;
  trangThai?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// API quản lý món ăn
export const getAllMonAn = async (params?: any) => {
  try {
    console.log('Gọi API lấy món ăn với params:', params);
    const response = await api.get('/mon-an', { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API getAllMonAn:', error);
    // Trả về dữ liệu giả để tránh lỗi UI
    return {
      success: true,
      data: [],
      page: 1,
      totalPages: 0,
      totalItems: 0,
      message: 'API lỗi, hiển thị dữ liệu giả'
    };
  }
};

export const getMonAnById = async (id: string) => {
  const response = await api.get(`/mon-an/${id}`);
  return response.data;
};

export const createMonAn = async (monAn: MonAn) => {
  const response = await api.post('/mon-an', monAn);
  return response.data;
};

export const updateMonAn = async (id: string, monAn: Partial<MonAn>) => {
  const response = await api.put(`/mon-an/${id}`, monAn);
  return response.data;
};

export const deleteMonAn = async (id: string) => {
  const response = await api.delete(`/mon-an/${id}`);
  return response.data;
};

export const toggleMonAnStatus = async (id: string) => {
  const response = await api.patch(`/mon-an/${id}/toggle-status`);
  return response.data;
};

// API quản lý loại món ăn
export const getAllLoaiMonAn = async (params?: any) => {
  try {
    const response = await api.get('/loai-mon-an', { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API getAllLoaiMonAn:', error);
    return {
      success: true,
      data: [],
      page: 1,
      totalPages: 0,
      totalItems: 0,
      message: 'API lỗi, hiển thị dữ liệu giả'
    };
  }
};

export const getLoaiMonAnById = async (id: string) => {
  const response = await api.get(`/loai-mon-an/${id}`);
  return response.data;
};

export const createLoaiMonAn = async (loaiMonAn: LoaiMonAn) => {
  const response = await api.post('/loai-mon-an', loaiMonAn);
  return response.data;
};

export const updateLoaiMonAn = async (id: string, loaiMonAn: Partial<LoaiMonAn>) => {
  const response = await api.put(`/loai-mon-an/${id}`, loaiMonAn);
  return response.data;
};

export const deleteLoaiMonAn = async (id: string) => {
  const response = await api.delete(`/loai-mon-an/${id}`);
  return response.data;
};

export const toggleLoaiMonAnStatus = async (id: string) => {
  const response = await api.patch(`/loai-mon-an/${id}/toggle-status`);
  return response.data;
};

// API xóa tất cả món ăn
export const deleteAllMonAn = async () => {
  const response = await api.delete('/mon-an/delete-all');
  return response.data;
};

// API xóa tất cả loại món ăn
export const deleteAllLoaiMonAn = async () => {
  const response = await api.delete('/loai-mon-an/delete-all');
  return response.data;
}; 