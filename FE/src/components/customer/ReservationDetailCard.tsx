import React from 'react';
import {
  Box,
  Stack,
  Chip,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  ChildCare as ChildCareIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Interface cho dữ liệu đặt bàn
interface Reservation {
  _id: string;
  hoTen: string;
  soDienThoai: string;
  email?: string;
  nhaHang: string;
  ngayDat: string;
  gioDat: string;
  soLuongKhach: number;
  soLuongNguoiLon?: number;
  soLuongTreEm?: number;
  tongTien: number;
  trangThai: string;
  ghiChu?: string;
}

// Props của component
interface ReservationDetailCardProps {
  reservation: Reservation;
}

/**
 * Component hiển thị thông tin chi tiết đặt bàn
 */
const ReservationDetailCard: React.FC<ReservationDetailCardProps> = ({ reservation }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Thông tin đặt bàn
      </Typography>
      
      <Grid container spacing={3}>
        {/* Thông tin cơ bản */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Họ tên
              </Typography>
              <Typography variant="body1">
                {reservation.hoTen}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <RestaurantMenuIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Nhà hàng
              </Typography>
              <Typography variant="body1">
                {reservation.nhaHang}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <EventIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Ngày đặt
              </Typography>
              <Typography variant="body1">
                {format(new Date(reservation.ngayDat), 'dd/MM/yyyy')}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Giờ đặt
              </Typography>
              <Typography variant="body1">
                {reservation.gioDat}
              </Typography>
            </Box>
          </Stack>
        </Grid>
        
        {/* Thông tin số lượng và chi phí */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Số lượng khách
              </Typography>
              
              {reservation.soLuongNguoiLon !== undefined && reservation.soLuongTreEm !== undefined ? (
                <Box>
                  <Chip
                    size="small"
                    icon={<PersonIcon />}
                    label={`${reservation.soLuongNguoiLon} người lớn`}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    size="small"
                    icon={<ChildCareIcon />}
                    label={`${reservation.soLuongTreEm} trẻ em`}
                    color="info"
                    variant="outlined"
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Tổng cộng: {Number(reservation.soLuongNguoiLon) + Number(reservation.soLuongTreEm)} người
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1">
                  {reservation.soLuongKhach} người
                </Typography>
              )}
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <AttachMoneyIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tổng tiền
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reservation.tongTien || 0)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Trạng thái
              </Typography>
              <Chip
                label={reservation.trangThai}
                color={
                  reservation.trangThai === 'Đã xác nhận' ? 'success' :
                  reservation.trangThai === 'Chờ xác nhận' ? 'warning' :
                  reservation.trangThai === 'Đã hủy' ? 'error' : 'default'
                }
                size="small"
              />
            </Box>
          </Stack>
        </Grid>
        
        {/* Hiển thị ghi chú nếu có */}
        {reservation.ghiChu && (
          <Grid item xs={12}>
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Ghi chú
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  {reservation.ghiChu}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ReservationDetailCard; 