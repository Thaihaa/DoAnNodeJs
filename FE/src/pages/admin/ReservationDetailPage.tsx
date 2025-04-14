import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  RestaurantMenu as RestaurantMenuIcon,
  Person as PersonIcon,
  ChildCare as ChildCareIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Notes as NotesIcon,
  PeopleAlt as PeopleAltIcon,
  LocationOn as LocationOnIcon,
  Room as RoomIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';

// Interface cho dữ liệu đặt bàn
interface Reservation {
  _id: string;
  nguoiDat?: {
    _id: string;
    username: string;
    fullName: string;
  };
  hoTen: string;
  soDienThoai: string;
  email: string;
  nhaHang: string;
  ban?: {
    _id: string;
    maBan: string;
    viTri: string;
    soLuongKhachToiDa: number;
  };
  ngayDat: string;
  gioDat: string;
  soLuongKhach: number;
  soLuongNguoiLon?: number;
  soLuongTreEm?: number;
  ghiChu?: string;
  trangThai: 'Chờ xác nhận' | 'Đã xác nhận' | 'Đã hủy' | 'Hoàn thành';
  tongTien: number;
  createdAt: string;
  updatedAt: string;
}

const ReservationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State cho dữ liệu và loading
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State cho form chỉnh sửa trạng thái
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<Reservation['trangThai']>('Chờ xác nhận');
  
  // State cho snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Lấy dữ liệu đặt bàn khi component được mount
  useEffect(() => {
    const fetchReservationDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('ID đặt bàn không hợp lệ');
        }
        
        const response = await api.get(`/order/dat-ban/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          setReservation(response.data.data);
        } else {
          setError(response.data?.message || 'Không thể tải thông tin đặt bàn');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Lỗi khi tải dữ liệu đặt bàn');
        console.error('Lỗi khi tải chi tiết đặt bàn:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservationDetail();
  }, [id]);
  
  // Kiểm tra nếu đang loading
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography mt={2}>Đang tải thông tin đặt bàn...</Typography>
      </Container>
    );
  }
  
  // Kiểm tra nếu có lỗi
  if (error || !reservation) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Không tìm thấy thông tin đặt bàn'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/admin/reservations')}
        >
          Quay lại danh sách đặt bàn
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Chi tiết đặt bàn</Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/admin/reservations')}
          >
            Quay lại danh sách
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Thông tin cơ bản */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                <strong>Khách hàng:</strong> {reservation.hoTen}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                <strong>SĐT:</strong> {reservation.soDienThoai}
              </Typography>
              
              {reservation.email && (
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  <strong>Email:</strong> {reservation.email}
                </Typography>
              )}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <RestaurantMenuIcon fontSize="small" sx={{ mr: 1 }} />
                <strong>Nhà hàng:</strong> {reservation.nhaHang}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon fontSize="small" sx={{ mr: 1 }} />
                <strong>Ngày đặt:</strong> {format(new Date(reservation.ngayDat), 'dd/MM/yyyy')}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                <strong>Giờ đặt:</strong> {reservation.gioDat}
              </Typography>
            </Stack>
          </Grid>
          
          {/* Số lượng khách */}
          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                <PeopleAltIcon fontSize="small" sx={{ mb: -0.5, mr: 1 }} />
                Số lượng khách
              </Typography>
              <Typography>
                {reservation.soLuongNguoiLon !== undefined && reservation.soLuongTreEm !== undefined ? (
                  <>
                    <Chip
                      icon={<PersonIcon />}
                      label={`${reservation.soLuongNguoiLon} người lớn`}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      icon={<ChildCareIcon />}
                      label={`${reservation.soLuongTreEm} trẻ em`}
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="caption" display="block" mt={0.5}>
                      Tổng cộng: {reservation.soLuongKhach} người
                    </Typography>
                  </>
                ) : (
                  reservation.soLuongKhach || 'Không có thông tin'
                )}
              </Typography>
            </Stack>
          </Grid>
          
          {/* Trạng thái */}
          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                Trạng thái
              </Typography>
              <Box>
                <Chip
                  label={reservation.trangThai}
                  color={
                    reservation.trangThai === 'Đã xác nhận' ? 'success' :
                    reservation.trangThai === 'Chờ xác nhận' ? 'warning' :
                    reservation.trangThai === 'Đã hủy' ? 'error' : 'info'
                  }
                  sx={{ mr: 1 }}
                />
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => setStatusDialogOpen(true)}
                >
                  Cập nhật
                </Button>
              </Box>
            </Stack>
          </Grid>
          
          {/* Tổng tiền */}
          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                Tổng tiền
              </Typography>
              <Typography variant="h6" color="primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reservation.tongTien)}
              </Typography>
            </Stack>
          </Grid>
          
          {/* Ghi chú */}
          {reservation.ghiChu && (
            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  <NotesIcon fontSize="small" sx={{ mb: -0.5, mr: 1 }} />
                  Ghi chú
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography>{reservation.ghiChu}</Typography>
                </Paper>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Dialog cập nhật trạng thái */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Cập nhật trạng thái đặt bàn</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Chọn trạng thái mới cho đơn đặt bàn:
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={newStatus}
              label="Trạng thái"
              onChange={(e: SelectChangeEvent) => setNewStatus(e.target.value as Reservation['trangThai'])}
            >
              <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
              <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
              <MenuItem value="Đã hủy">Đã hủy</MenuItem>
              <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Hủy</Button>
          <Button onClick={async () => {
            try {
              const response = await api.put(`/order/dat-ban/${id}/status`, {
                trangThai: newStatus
              }, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (response.data && response.data.success) {
                setSnackbar({
                  open: true,
                  message: 'Cập nhật trạng thái thành công',
                  severity: 'success'
                });
                setReservation({
                  ...reservation,
                  trangThai: newStatus
                });
              } else {
                throw new Error(response.data?.message || 'Cập nhật không thành công');
              }
            } catch (error: any) {
              setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Lỗi khi cập nhật trạng thái',
                severity: 'error'
              });
            } finally {
              setStatusDialogOpen(false);
            }
          }} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReservationDetailPage; 