// Khai báo kiểu cho User
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  role: 'user' | 'staff' | 'admin';
  isActive: boolean;
}

// Khai báo kiểu cho Nhà hàng
export interface Restaurant {
  _id: string;
  tenNhaHang: string;
  diaChi: string;
  dienThoai: string;
  email: string;
  website?: string;
  gioMoCua: string;
  gioDongCua: string;
  moTa?: string;
  hinhAnh: string[];
  danhGiaTrungBinh: number;
  soLuongDanhGia: number;
  trangThai: 'Đang hoạt động' | 'Tạm ngưng' | 'Đóng cửa';
  viTri?: {
    type: string;
    coordinates: [number, number];
  };
}

// Khai báo kiểu cho Bàn
export interface Ban {
  _id: string;
  maBan: string;
  nhaHang: string | Restaurant;
  viTri: string;
  soLuongKhachToiDa: number;
  trangThai: 'Có sẵn' | 'Đang sử dụng' | 'Bảo trì';
  moTa?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Khai báo kiểu cho Loại món ăn
export interface FoodCategory {
  _id: string;
  tenLoai: string;
  moTa?: string;
  hinhAnh?: string;
  thuTu: number;
  trangThai: boolean;
}

// Khai báo kiểu cho Món ăn
export interface Food {
  _id: string;
  tenMon: string;
  moTa?: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  nguyenLieu?: string;
  loaiMonAn: string | FoodCategory;
  nhaHang: string | Restaurant;
  trangThai: boolean;
  noiBat: boolean;
  danhGiaTrungBinh: number;
  soLuongDanhGia: number;
  thuTu: number;
}

// Khai báo kiểu cho Đặt bàn
export interface Reservation {
  _id: string;
  nguoiDat?: string | User;
  hoTen: string;
  soDienThoai: string;
  email?: string;
  nhaHang: string | Restaurant;
  ban?: string | Ban;
  ngayDat: string; // ISO date string
  gioDat: string;
  soLuongKhach: number;
  ghiChu?: string;
  trangThai: 'Chờ xác nhận' | 'Đã xác nhận' | 'Đã hủy' | 'Hoàn thành';
  monAnDat?: Array<{
    monAn: string | Food;
    soLuong: number;
    gia: number;
    ghiChu?: string;
  }>;
  tongTien: number;
  createdAt: string;
  updatedAt: string;
}

// Khai báo kiểu cho Đánh giá
export interface Review {
  _id: string;
  nguoiDanhGia: string | User;
  nhaHang: string | Restaurant;
  monAn?: string | Food;
  diem: number;
  noiDung: string;
  hinhAnh?: string[];
  traLoi?: Array<{
    nguoiTraLoi: string | User;
    noiDung: string;
    createdAt: string;
  }>;
  daXacThuc: boolean;
  trangThai: boolean;
  createdAt: string;
  updatedAt: string;
}

// Khai báo kiểu cho authentication response
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

// Khai báo kiểu cho API response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    totalPages?: number;
    total?: number;
    limit?: number;
  };
  errors?: any;
}

// Khai báo kiểu cho Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Khai báo kiểu cho BuffetInfo
export interface BuffetInfo {
  adult: {
    prices: number[];
  };
  children: {
    freeUnder: number;
    discountAge: {
      min: number;
      max: number;
      percentage: number;
    };
  };
}

// Kiểu cho thông tin địa điểm Manwah
export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  description: string;
  imageUrl: string;
}

// Restaurant Promotion
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

// Socket.io types
export interface ReservationNotification {
  id: string;
  trangThai: string;
  message: string;
  updatedAt: string | Date;
}

export interface NewReservationNotification {
  id: string;
  hoTen: string;
  nhaHang: string;
  ngayDat: string;
  gioDat: string;
  trangThai: string;
  message: string;
  createdAt: string | Date;
} 