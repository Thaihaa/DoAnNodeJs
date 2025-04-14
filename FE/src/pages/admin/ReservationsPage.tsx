import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack,
  Alert,
  Snackbar,
  SelectChangeEvent,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  ChildCare as ChildCareIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import api from '../../services/api';
import socketService from '../../services/socketService';
import useSocketNotifications from '../../hooks/useSocketNotifications';

// Định nghĩa loại đặt bàn
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
  ghiChu?: string;
  trangThai: 'Chờ xác nhận' | 'Đã xác nhận' | 'Đã hủy' | 'Hoàn thành';
  tongTien: number;
  createdAt: string;
  updatedAt: string;
  soLuongNguoiLon?: number;
  soLuongTreEm?: number;
}

// Component chính
const ReservationsPage = () => {
  // State cho dữ liệu và tìm kiếm
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State cho modal chi tiết
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  // State cho modal xóa
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);

  // State cho snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Sử dụng hook thông báo socket riêng
  const socketNotifications = useSocketNotifications();
  
  // Fetch dữ liệu đặt bàn từ API
  useEffect(() => {
    fetchReservations();

  }, []);
  
  // Đăng ký callback xử lý khi có đặt bàn mới
  useEffect(() => {

    
    // Xử lý thông báo đặt bàn mới
    socketNotifications.onNewReservation((notification) => {

      
      // Cập nhật danh sách đặt bàn
      fetchReservations();
      
      // Hiển thị thông báo
      setSnackbar({
        open: true,
        message: `Có đơn đặt bàn mới từ ${notification.hoTen || 'khách hàng'}!`,
        severity: 'info'
      });
    });
    
    // Xử lý thông báo cập nhật trạng thái
    socketNotifications.onStatusUpdate((notification) => {

      
      // Cập nhật danh sách đặt bàn
      fetchReservations();
      
      // Hiển thị thông báo
      setSnackbar({
        open: true,
        message: `Đơn đặt bàn đã được cập nhật trạng thái thành: ${notification.trangThai}`,
        severity: 'info'
      });
    });
  }, []);
  
  // Thêm useEffect để kiểm tra kết nối socket
  useEffect(() => {
    const checkSocketConnection = () => {
      const isConnected = socketService.isConnected();
      console.log('Trạng thái kết nối socket:', isConnected ? 'ĐÃ KẾT NỐI' : 'CHƯA KẾT NỐI');
    };
    
    // Kiểm tra ngay lập tức và mỗi 5 giây
    checkSocketConnection();
    const intervalId = setInterval(checkSocketConnection, 5000);
    
    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Hàm lấy danh sách đặt bàn từ API
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Đang gọi API lấy danh sách đặt bàn...');
      
      const response = await api.get('/order/dat-ban', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('API response full:', response);
      
      if (response.data && response.data.success) {
        console.log('API response data:', response.data);
        
        // Kiểm tra dữ liệu trả về
        const reservationData = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('Reservation data parsed:', reservationData);
        
        setReservations(reservationData);
        setFilteredReservations(reservationData);
        setLoading(false);
      } else {
        console.error('API trả về lỗi:', response.data);
        setError(response.data?.message || 'Không thể tải dữ liệu đặt bàn');
        setReservations([]);
        setFilteredReservations([]);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải dữ liệu đặt bàn:', error);
      console.error('Chi tiết lỗi:', error.response?.data);
      setError(error.response?.data?.message || 'Lỗi kết nối đến server.');
      setReservations([]);
      setFilteredReservations([]);
      setLoading(false);
    }
  };
  
  // Xử lý thay đổi trang
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Xử lý thay đổi số hàng trên mỗi trang
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Xử lý tìm kiếm
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterReservations(value, statusFilter, dateFilter);
  };

  // Xử lý lọc theo trạng thái
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setStatusFilter(value);
    filterReservations(searchTerm, value, dateFilter);
  };

  // Xử lý lọc theo ngày
  const handleDateFilterChange = (newDate: Date | null) => {
    setDateFilter(newDate);
    filterReservations(searchTerm, statusFilter, newDate);
  };

  // Hàm lọc đặt bàn
  const filterReservations = (search: string, status: string, date: Date | null) => {
    // Đảm bảo reservations đã được khởi tạo
    if (!Array.isArray(reservations)) {
      setFilteredReservations([]);
      return;
    }
    
    let filtered = [...reservations];
    
    // Lọc theo từ khóa tìm kiếm
    if (search) {
      filtered = filtered.filter(reservation => 
        (reservation.hoTen && reservation.hoTen.toLowerCase().includes(search.toLowerCase())) ||
        (reservation.soDienThoai && reservation.soDienThoai.includes(search)) ||
        (reservation.email && reservation.email.toLowerCase().includes(search.toLowerCase())) ||
        (reservation.nhaHang && reservation.nhaHang.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Lọc theo trạng thái
    if (status !== 'all') {
      filtered = filtered.filter(reservation => reservation.trangThai === status);
    }
    
    // Lọc theo ngày
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      filtered = filtered.filter(reservation => {
        const reservationDate = new Date(reservation.ngayDat);
        return format(reservationDate, 'yyyy-MM-dd') === dateString;
      });
    }
    
    setFilteredReservations(filtered);
  };

  // Xử lý mở modal chi tiết
  const handleOpenDetailModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setOpenDetailModal(true);
  };

  // Xử lý đóng modal chi tiết
  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
  };

  // Xử lý mở modal xác nhận xóa
  const handleOpenDeleteModal = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setOpenDeleteModal(true);
  };

  // Xử lý đóng modal xác nhận xóa
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setReservationToDelete(null);
  };

  // Xử lý xóa đặt bàn
  const handleDeleteReservation = async () => {
    if (reservationToDelete) {
      try {
        // Gọi API để xóa đặt bàn
        const response = await api.delete(`/order/dat-ban/${reservationToDelete._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          // Refresh dữ liệu sau khi xóa
          await fetchReservations();
          
          setSnackbar({
            open: true,
            message: 'Xóa đặt bàn thành công!',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: response.data?.message || 'Lỗi xóa đặt bàn!',
            severity: 'error'
          });
        }
      } catch (error: any) {
        console.error('Lỗi khi xóa đặt bàn:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Lỗi xóa đặt bàn!',
          severity: 'error'
        });
      }
      
      setOpenDeleteModal(false);
    }
  };

  // Xử lý thay đổi trạng thái đặt bàn
  const handleChangeStatus = async (reservation: Reservation, newStatus: Reservation['trangThai']) => {
    try {
      console.log(`Đang cập nhật trạng thái cho đặt bàn ${reservation._id} thành ${newStatus}`);
      
      // Tạo URL trực tiếp tới endpoint
      const url = `http://localhost:5000/api/order/dat-ban/${reservation._id}/trang-thai`;
      console.log('API URL:', url);
      
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Có' : 'Không');
      
      // Gọi API trực tiếp không qua instance Axios
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trangThai: newStatus })
      });
      
      const responseData = await response.json();
      console.log('Kết quả API:', responseData);
      
      if (response.ok && responseData.success) {
        // Refresh dữ liệu sau khi thay đổi trạng thái
        await fetchReservations();
        
        setSnackbar({
          open: true,
          message: `Trạng thái đặt bàn đã được chuyển thành "${newStatus}"!`,
          severity: 'success'
        });
      } else {
        console.error('API trả về lỗi:', responseData);
        setSnackbar({
          open: true,
          message: responseData?.message || `Lỗi khi chuyển trạng thái đặt bàn thành "${newStatus}"!`,
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Lỗi khi thay đổi trạng thái đặt bàn:', error);
      console.error('Chi tiết lỗi:', error.response?.data);
      setSnackbar({
        open: true,
        message: error.message || 'Lỗi khi thay đổi trạng thái đặt bàn!',
        severity: 'error'
      });
    }
  };

  // Xử lý đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Hiển thị chip trạng thái với màu sắc phù hợp
  const renderStatusChip = (status: Reservation['trangThai']) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case 'Chờ xác nhận':
        color = 'warning';
        break;
      case 'Đã xác nhận':
        color = 'info';
        break;
      case 'Hoàn thành':
        color = 'success';
        break;
      case 'Đã hủy':
        color = 'error';
        break;
    }
    
    return (
      <Chip 
        label={status} 
        size="small"
        color={color}
      />
    );
  };

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Quản lý đặt bàn
      </Typography>
      
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {/* Toolbar tìm kiếm và lọc */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-start' }}>
          <TextField
            placeholder="Tìm kiếm theo tên, SĐT, email..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Trạng thái</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Trạng thái"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
              <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
              <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
              <MenuItem value="Đã hủy">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
            <DatePicker
              label="Lọc theo ngày"
              value={dateFilter}
              onChange={handleDateFilterChange}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter(null);
              fetchReservations();
            }}
          >
            Làm mới
          </Button>
        </Box>
      </Paper>
      
      {/* Bảng dữ liệu đặt bàn */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Mã đặt bàn</TableCell>
                <TableCell>Thông tin khách</TableCell>
                <TableCell>Nhà hàng</TableCell>
                <TableCell>Ngày & giờ</TableCell>
                <TableCell>Số khách</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Đang tải dữ liệu...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : !filteredReservations || filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      Không có dữ liệu đặt bàn
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((reservation) => (
                    <TableRow key={reservation._id}>
                      <TableCell>{reservation._id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{reservation.hoTen}</Typography>
                        <Typography variant="caption" color="text.secondary">{reservation.soDienThoai}</Typography>
                        {reservation.email && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {reservation.email}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{reservation.nhaHang}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(reservation.ngayDat).toLocaleDateString('vi-VN')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reservation.gioDat}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reservation.soLuongNguoiLon || reservation.soLuongTreEm ? (
                          <Stack direction="row" spacing={1}>
                            <Chip 
                              size="small" 
                              icon={<PersonIcon />} 
                              label={`${reservation.soLuongNguoiLon || 0} NL`} 
                              color="primary"
                              variant="outlined"
                            />
                            <Chip 
                              size="small" 
                              icon={<ChildCareIcon />} 
                              label={`${reservation.soLuongTreEm || 0} TE`} 
                              color="info"
                              variant="outlined"
                            />
                          </Stack>
                        ) : (
                          reservation.soLuongKhach
                        )}
                      </TableCell>
                      <TableCell>{renderStatusChip(reservation.trangThai)}</TableCell>
                      <TableCell>{formatCurrency(reservation.tongTien)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Xem chi tiết">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenDetailModal(reservation)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {reservation.trangThai === 'Chờ xác nhận' && (
                            <Tooltip title="Xác nhận">
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleChangeStatus(reservation, 'Đã xác nhận')}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {(reservation.trangThai === 'Chờ xác nhận' || reservation.trangThai === 'Đã xác nhận') && (
                            <Tooltip title="Hoàn thành">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleChangeStatus(reservation, 'Hoàn thành')}
                              >
                                <RestaurantMenuIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {(reservation.trangThai === 'Chờ xác nhận' || reservation.trangThai === 'Đã xác nhận') && (
                            <Tooltip title="Hủy">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleChangeStatus(reservation, 'Đã hủy')}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Xóa">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOpenDeleteModal(reservation)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredReservations ? filteredReservations.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>

      {/* Modal chi tiết đặt bàn */}
      <Dialog 
        open={openDetailModal} 
        onClose={handleCloseDetailModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết đặt bàn</DialogTitle>
        
        {selectedReservation && (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Thông tin khách hàng
                </Typography>
                <Typography variant="body2">
                  <strong>Họ tên:</strong> {selectedReservation.hoTen}
                </Typography>
                <Typography variant="body2">
                  <strong>Số điện thoại:</strong> {selectedReservation.soDienThoai}
                </Typography>
                {selectedReservation.email && (
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedReservation.email}
                  </Typography>
                )}
                {selectedReservation.nguoiDat && (
                  <Typography variant="body2">
                    <strong>Tài khoản:</strong> {selectedReservation.nguoiDat.username}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Thông tin đặt bàn
                </Typography>
                <Typography variant="body2">
                  <strong>Nhà hàng:</strong> {selectedReservation.nhaHang}
                </Typography>
                {selectedReservation.ban && (
                  <Typography variant="body2">
                    <strong>Bàn:</strong> {selectedReservation.ban.maBan} (Vị trí: {selectedReservation.ban.viTri})
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Ngày đặt:</strong> {new Date(selectedReservation.ngayDat).toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="body2">
                  <strong>Giờ đặt:</strong> {selectedReservation.gioDat}
                </Typography>
                <Typography variant="body2">
                  <strong>Số lượng khách:</strong> {selectedReservation.soLuongKhach} người
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Trạng thái
                  </Typography>
                  <Box>
                    {renderStatusChip(selectedReservation.trangThai)}
                  </Box>
                </Box>
              </Grid>
              
              {selectedReservation.ghiChu && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Ghi chú
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="body2">
                      {selectedReservation.ghiChu}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Tổng tiền đặt cọc
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {formatCurrency(selectedReservation.tongTien)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, color: 'text.secondary' }}>
                  <Typography variant="caption">
                    Ngày tạo: {new Date(selectedReservation.createdAt).toLocaleString('vi-VN')}
                  </Typography>
                  <Typography variant="caption">
                    Cập nhật: {new Date(selectedReservation.updatedAt).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Đóng</Button>
          
          {selectedReservation && selectedReservation.trangThai === 'Chờ xác nhận' && (
            <Button 
              onClick={() => {
                handleChangeStatus(selectedReservation, 'Đã xác nhận');
                handleCloseDetailModal();
              }} 
              variant="contained" 
              color="info"
            >
              Xác nhận đặt bàn
            </Button>
          )}
          
          {selectedReservation && (selectedReservation.trangThai === 'Chờ xác nhận' || selectedReservation.trangThai === 'Đã xác nhận') && (
            <Button 
              onClick={() => {
                handleChangeStatus(selectedReservation, 'Hoàn thành');
                handleCloseDetailModal();
              }} 
              variant="contained" 
              color="success"
            >
              Hoàn thành
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal xác nhận xóa */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa thông tin đặt bàn của 
            <Typography component="span" fontWeight="bold" color="error">
              {" "}{reservationToDelete?.hoTen}{" "}
            </Typography>
            vào ngày {reservationToDelete && new Date(reservationToDelete.ngayDat).toLocaleDateString('vi-VN')} không?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Lưu ý: Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>Hủy</Button>
          <Button 
            onClick={handleDeleteReservation} 
            variant="contained" 
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReservationsPage; 