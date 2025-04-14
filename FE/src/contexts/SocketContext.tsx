import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import { ReservationNotification, NewReservationNotification } from '../types';

interface SocketContextType {
  isConnected: boolean;
  newReservationNotifications: NewReservationNotification[];
  statusUpdateNotifications: ReservationNotification[];
  clearNotifications: () => void;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  newReservationNotifications: [],
  statusUpdateNotifications: [],
  clearNotifications: () => {},
  connect: () => {},
  disconnect: () => {}
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [newReservationNotifications, setNewReservationNotifications] = useState<NewReservationNotification[]>([]);
  const [statusUpdateNotifications, setStatusUpdateNotifications] = useState<ReservationNotification[]>([]);

  // Kết nối socket khi user đăng nhập
  const connect = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    
    const socket = socketService.connect();
    
    if (socket) {
      setIsConnected(socket.connected);
      
      // Tham gia các phòng dựa trên vai trò
      if (user && user.role === 'admin') {
        socketService.joinAdminRoom();
      }
      
      if (user && user._id) {
        socketService.joinUserRoom(user._id);
      }
    }
  }, [isAuthenticated, user]);

  // Ngắt kết nối socket khi component unmount hoặc user logout
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
  }, []);

  // Xóa tất cả thông báo
  const clearNotifications = () => {
    setNewReservationNotifications([]);
    setStatusUpdateNotifications([]);
  };

  // Kết nối khi user thay đổi
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
      // Xóa thông báo khi đăng xuất
      clearNotifications();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  // Đăng ký các event listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Cập nhật trạng thái kết nối khi socket thay đổi
    const updateConnectionStatus = () => {
      setIsConnected(socketService.isConnected());
    };
    
    // Kiểm tra kết nối mỗi 5 giây
    const intervalId = setInterval(updateConnectionStatus, 5000);
    
    // Xử lý thông báo đặt bàn mới
    const handleNewReservation = (data: NewReservationNotification) => {
      if (!data) return;
      
      setNewReservationNotifications(prev => {
        // Kiểm tra trùng lặp
        const isDuplicate = prev.some(item => item.id === data.id);
        if (isDuplicate) return prev;
        return [data, ...prev.slice(0, 9)];
      });
    };

    // Xử lý thông báo cập nhật trạng thái
    const handleReservationUpdated = (data: ReservationNotification) => {
      if (!data) return;
      
      setStatusUpdateNotifications(prev => {
        // Kiểm tra trùng lặp
        const isDuplicate = prev.some(item => item.id === data.id);
        if (isDuplicate) return prev;
        return [data, ...prev.slice(0, 9)];
      });
    };

    // Xử lý thông báo thay đổi trạng thái đơn đặt bàn của user
    const handleReservationStatusChanged = (data: ReservationNotification) => {
      if (!data) return;
      
      setStatusUpdateNotifications(prev => {
        // Kiểm tra trùng lặp
        const isDuplicate = prev.some(item => item.id === data.id);
        if (isDuplicate) return prev;
        return [data, ...prev.slice(0, 9)];
      });
    };

    // Đăng ký lắng nghe các sự kiện
    socketService.onNewReservation(handleNewReservation);
    socketService.onReservationUpdated(handleReservationUpdated);
    socketService.onReservationStatusChanged(handleReservationStatusChanged);

    // Hủy đăng ký khi component unmount
    return () => {
      clearInterval(intervalId);
      socketService.removeListener('new_reservation', handleNewReservation);
      socketService.removeListener('reservation_updated', handleReservationUpdated);
      socketService.removeListener('reservation_status_changed', handleReservationStatusChanged);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        newReservationNotifications,
        statusUpdateNotifications,
        clearNotifications,
        connect,
        disconnect
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}; 