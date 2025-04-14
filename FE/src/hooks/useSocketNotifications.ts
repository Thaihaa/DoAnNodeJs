import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import { NewReservationNotification, ReservationNotification } from '../types';

/**
 * Hook tùy chỉnh để xử lý thông báo socket theo thời gian thực
 */
export const useSocketNotifications = () => {
  const [newReservations, setNewReservations] = useState<NewReservationNotification[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<ReservationNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Sử dụng ref để theo dõi callback mới nhất đến sau mỗi thông báo mới
  const onNewReservationCallback = useRef<((notification: NewReservationNotification) => void) | null>(null);
  const onStatusUpdateCallback = useRef<((notification: ReservationNotification) => void) | null>(null);
  
  // Kết nối socket và đăng ký lắng nghe sự kiện
  useEffect(() => {
    console.log('[useSocketNotifications] Hook được khởi tạo, đang kết nối socket...');
    
    // Đảm bảo socket được kết nối
    const socket = socketService.connect();
    if (socket) {
      socketService.joinAdminRoom(); // Tự động tham gia phòng admin
      setIsConnected(true);
      console.log('[useSocketNotifications] Socket đã kết nối thành công');
    }
    
    // Lắng nghe trực tiếp từ socket.io thay vì qua lớp trung gian
    const directSocket = socketService.getSocket();
    
    if (directSocket) {
      console.log('[useSocketNotifications] Đang đăng ký lắng nghe trực tiếp từ socket');
      
      // Định nghĩa các hàm xử lý sự kiện
      const handleNewReservation = (data: NewReservationNotification) => {
        console.log('[useSocketNotifications] Nhận thông báo đặt bàn mới:', data);
        setNewReservations(prev => [data, ...prev]);
        
        // Gọi callback nếu có
        if (onNewReservationCallback.current) {
          onNewReservationCallback.current(data);
        }
      };
      
      const handleStatusUpdate = (data: ReservationNotification) => {
        console.log('[useSocketNotifications] Nhận thông báo cập nhật trạng thái:', data);
        setStatusUpdates(prev => [data, ...prev]);
        
        // Gọi callback nếu có
        if (onStatusUpdateCallback.current) {
          onStatusUpdateCallback.current(data);
        }
      };

      // Đăng ký lắng nghe trực tiếp
      directSocket.on('new_reservation', handleNewReservation);
      directSocket.on('reservation_updated', handleStatusUpdate);
      directSocket.on('reservation_status_changed', handleStatusUpdate);
      
      // Dọn dẹp khi component unmount
      return () => {
        console.log('[useSocketNotifications] Hủy đăng ký lắng nghe trực tiếp');
        directSocket.off('new_reservation', handleNewReservation);
        directSocket.off('reservation_updated', handleStatusUpdate);
        directSocket.off('reservation_status_changed', handleStatusUpdate);
      };
    } else {
      // Sử dụng phương pháp cũ nếu không có direct socket
      console.log('[useSocketNotifications] Không thể lấy direct socket, sử dụng phương pháp thay thế');
      
      // Lắng nghe sự kiện đặt bàn mới
      const handleNewReservation = (data: NewReservationNotification) => {
        console.log('[useSocketNotifications] Nhận thông báo đặt bàn mới:', data);
        setNewReservations(prev => [data, ...prev]);
        
        // Gọi callback nếu có
        if (onNewReservationCallback.current) {
          onNewReservationCallback.current(data);
        }
      };
      
      // Lắng nghe sự kiện cập nhật trạng thái
      const handleStatusUpdate = (data: ReservationNotification) => {
        console.log('[useSocketNotifications] Nhận thông báo cập nhật trạng thái:', data);
        setStatusUpdates(prev => [data, ...prev]);
        
        // Gọi callback nếu có
        if (onStatusUpdateCallback.current) {
          onStatusUpdateCallback.current(data);
        }
      };
      
      // Đăng ký lắng nghe các sự kiện
      socketService.onNewReservation(handleNewReservation);
      socketService.onReservationUpdated(handleStatusUpdate);
      socketService.onReservationStatusChanged(handleStatusUpdate);
      
      // Dọn dẹp khi component unmount
      return () => {
        socketService.removeListener('new_reservation', handleNewReservation);
        socketService.removeListener('reservation_updated', handleStatusUpdate);
        socketService.removeListener('reservation_status_changed', handleStatusUpdate);
        console.log('[useSocketNotifications] Đã hủy đăng ký lắng nghe sự kiện');
      };
    }
  }, []);
  
  // Hàm đăng ký callback xử lý khi có đặt bàn mới
  const onNewReservation = (callback: (notification: NewReservationNotification) => void) => {
    onNewReservationCallback.current = callback;
  };
  
  // Hàm đăng ký callback xử lý khi có cập nhật trạng thái
  const onStatusUpdate = (callback: (notification: ReservationNotification) => void) => {
    onStatusUpdateCallback.current = callback;
  };
  
  // Hàm xóa tất cả thông báo
  const clearNotifications = () => {
    setNewReservations([]);
    setStatusUpdates([]);
  };
  
  return {
    newReservations,
    statusUpdates,
    isConnected,
    onNewReservation,
    onStatusUpdate,
    clearNotifications
  };
};

export default useSocketNotifications; 