// import { io, Socket } from 'socket.io-client';
import socketIOClient from 'socket.io-client';
import { API_URL } from '../config';

// Xóa tiền tố /api để lấy URL cơ sở
const BASE_URL = API_URL.replace('/api', '');

// Lấy port của Order Service từ BASE_URL hoặc sử dụng port mặc định 5004
const SOCKET_URL = BASE_URL.includes('localhost') 
  ? 'http://localhost:5004' 
  : BASE_URL;

class SocketService {
  private socket: any = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Kết nối đến server Socket.IO
  connect() {
    try {
      // Nếu socket đã tồn tại và đang kết nối, không cần kết nối lại
      if (this.socket && this.socket.connected) {
        return this.socket;
      }
      
      // Nếu socket tồn tại nhưng đã ngắt kết nối, xóa bỏ nó
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      
      // Tạo kết nối socket mới
      this.socket = socketIOClient(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true
      });
      
      // Thêm các event listeners
      this.socket.on('connect', () => {
        console.log('[Socket] Đã kết nối thành công:', this.socket?.id);
      });
      
      this.socket.on('connect_error', (error: Error) => {
        console.error('[Socket] Lỗi kết nối:', error);
      });
      
      this.socket.on('connect_timeout', () => {
        console.error('[Socket] Kết nối bị timeout');
      });
      
      this.socket.on('error', (error: Error) => {
        console.error('[Socket] Lỗi:', error);
      });
      
      this.socket.on('disconnect', (reason: string) => {
        console.log('[Socket] Ngắt kết nối:', reason);
      });
      
      this.socket.on('reconnect', (attemptNumber: number) => {
        console.log('[Socket] Đã kết nối lại sau', attemptNumber, 'lần thử');
      });
      
      this.socket.on('reconnect_error', (error: Error) => {
        console.error('[Socket] Lỗi kết nối lại:', error);
      });
      
      this.socket.on('joined_room', (data: any) => {
        console.log('[Socket] Đã tham gia phòng:', data);
      });
      
      return this.socket;
    } catch (error) {
      console.error('[Socket] Lỗi nghiêm trọng khi khởi tạo socket:', error);
      return null;
    }
  }

  // Đóng kết nối Socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Tham gia phòng nhà hàng
  joinRestaurantRoom(restaurantId: string) {
    if (this.socket) {
      this.socket.emit('join_restaurant', restaurantId);
    }
  }

  // Tham gia phòng admin
  joinAdminRoom() {
    if (!this.socket) {
      this.connect();
    }
    
    if (this.socket) {
      // Kết nối lại nếu socket bị ngắt kết nối
      if (!this.socket.connected) {
        this.socket.connect();
      }
      
      this.socket.emit('join_admin');
    } else {
      console.error('[Socket] Không thể tham gia phòng admin - socket không tồn tại');
    }
  }

  // Tham gia phòng người dùng
  joinUserRoom(userId: string) {
    if (!this.socket) {
      this.connect();
    }
    
    if (this.socket) {
      // Kết nối lại nếu socket bị ngắt kết nối
      if (!this.socket.connected) {
        this.socket.connect();
      }
      
      this.socket.emit('join_user', userId);
    } else {
      console.error(`[Socket] Không thể tham gia phòng user ${userId} - socket không tồn tại`);
    }
  }

  // Lắng nghe sự kiện đơn đặt bàn mới
  onNewReservation(callback: (data: any) => void) {
    this.addListener('new_reservation', callback);
  }

  // Lắng nghe sự kiện cập nhật đơn đặt bàn
  onReservationUpdated(callback: (data: any) => void) {
    this.addListener('reservation_updated', callback);
  }

  // Lắng nghe sự kiện thay đổi trạng thái đơn đặt bàn của người dùng
  onReservationStatusChanged(callback: (data: any) => void) {
    this.addListener('reservation_status_changed', callback);
  }

  // Thêm callback vào danh sách lắng nghe
  private addListener(event: string, callback: (data: any) => void) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
      
      this.socket?.on(event, (data: any) => {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
          callbacks.forEach(cb => cb(data));
        }
      });
    }

    const callbacks = this.listeners.get(event);
    callbacks?.add(callback);
  }

  // Hủy đăng ký lắng nghe sự kiện
  removeListener(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  // Kiểm tra trạng thái kết nối
  isConnected() {
    return this.socket?.connected || false;
  }
  
  // Lấy tham chiếu trực tiếp tới đối tượng socket
  getSocket() {
    if (!this.socket) {
      this.connect();
    }
    return this.socket;
  }
}

// Tạo instance duy nhất
const socketService = new SocketService();

export default socketService; 