import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useSocket } from '../contexts/SocketContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { NewReservationNotification, ReservationNotification } from '../types';

type CombinedNotification = 
  | (NewReservationNotification & { type: 'new'; time: Date })
  | (ReservationNotification & { type: 'update'; time: Date });

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { 
    newReservationNotifications, 
    statusUpdateNotifications,
    clearNotifications 
  } = useSocket();
  
  // Log để debug
  console.log('NotificationBell render - Số thông báo mới:', newReservationNotifications.length);
  
  const open = Boolean(anchorEl);
  
  // Tính tổng số thông báo
  const notificationCount = 
    newReservationNotifications.length + 
    statusUpdateNotifications.length;
  
  // Kết hợp tất cả thông báo và sắp xếp theo thời gian giảm dần
  const allNotifications: CombinedNotification[] = [
    ...newReservationNotifications.map(notification => ({
      ...notification,
      type: 'new' as const,
      time: new Date(notification.createdAt)
    })),
    ...statusUpdateNotifications.map(notification => ({
      ...notification,
      type: 'update' as const,
      time: new Date(notification.updatedAt)
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime());

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClearNotifications = () => {
    clearNotifications();
    handleClose();
  };

  const handleNotificationClick = (notification: CombinedNotification) => {
    // Chuyển hướng đến trang quản lý đặt bàn khi nhấp vào thông báo
    if (notification.id) {
      navigate(`/admin/reservations/${notification.id}`);
    }
    handleClose();
  };

  // Render icon dựa trên trạng thái đặt bàn
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <CheckCircleIcon color="success" />;
      case 'Đã hủy':
        return <CancelIcon color="error" />;
      case 'Hoàn thành':
        return <EventAvailableIcon color="primary" />;
      default:
        return <AccessTimeIcon color="warning" />;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={notificationCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 350,
            maxHeight: 400,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Thông báo</Typography>
          {notificationCount > 0 && (
            <Typography 
              variant="subtitle2" 
              sx={{ cursor: 'pointer', color: 'primary.main' }}
              onClick={handleClearNotifications}
            >
              Xóa tất cả
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        {notificationCount === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="Không có thông báo mới" />
          </MenuItem>
        ) : (
          allNotifications.map((notification, index) => (
            <MenuItem key={index} onClick={() => handleNotificationClick(notification)}>
              <ListItemIcon>
                {notification.type === 'new' 
                  ? <RestaurantIcon color="primary" />
                  : getStatusIcon(notification.trangThai)
                }
              </ListItemIcon>
              <ListItemText 
                primary={notification.message}
                secondary={
                  <Typography variant="caption" display="block">
                    {notification.type === 'new' && 'hoTen' in notification 
                      ? `Khách hàng: ${notification.hoTen}` 
                      : ''}
                    <br />
                    {format(notification.time, 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </Typography>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 