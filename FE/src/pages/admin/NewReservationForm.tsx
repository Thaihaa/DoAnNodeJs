import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  SelectChangeEvent
} from '@mui/material';
import { 
  Person as PersonIcon,
  ChildCare as ChildCareIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Interface dữ liệu đặt bàn
interface ReservationFormData {
  hoTen: string;
  soDienThoai: string;
  email: string;
  nhaHang: string;
  ngayDat: Date | null;
  gioDat: Date | null;
  soLuongNguoiLon: number;
  soLuongTreEm: number;
  ghiChu: string;
}

// Interface lỗi form
interface FormErrors {
  hoTen?: string;
  soDienThoai?: string;
  email?: string;
  nhaHang?: string;
  ngayDat?: string;
  gioDat?: string;
  soLuongNguoiLon?: string;
  soLuongTreEm?: string;
}

// Interface nhà hàng
interface Restaurant {
  id: string;
  name: string;
}

const NewReservationForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  
  // State cho form data
  const [formData, setFormData] = useState<ReservationFormData>({
    hoTen: '',
    soDienThoai: '',
    email: '',
    nhaHang: '',
    ngayDat: null,
    gioDat: null,
    soLuongNguoiLon: 1,
    soLuongTreEm: 0,
    ghiChu: ''
  });
  
  // State cho lỗi form
  const [errors, setErrors] = useState<FormErrors>({});
  
  // State cho thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Lấy danh sách nhà hàng khi component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurant/nha-hang', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          setRestaurants(response.data.data.map((r: any) => ({
            id: r._id,
            name: r.tenNhaHang
          })));
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhà hàng:', error);
      }
    };
    
    fetchRestaurants();
  }, []);
  
  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Xử lý thay đổi select
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Xử lý thay đổi số
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData({ ...formData, [name]: numValue });
    }
  };
  
  // Validation form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.nhaHang) {
      newErrors.nhaHang = 'Vui lòng chọn nhà hàng';
    }
    
    if (!formData.ngayDat) {
      newErrors.ngayDat = 'Vui lòng chọn ngày đặt bàn';
    }
    
    if (!formData.gioDat) {
      newErrors.gioDat = 'Vui lòng chọn giờ đặt bàn';
    }
    
    if (formData.soLuongNguoiLon < 1) {
      newErrors.soLuongNguoiLon = 'Số lượng người lớn phải ít nhất là 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Format dữ liệu trước khi gửi
      const ngayDat = formData.ngayDat ? format(formData.ngayDat, 'yyyy-MM-dd') : '';
      const gioDat = formData.gioDat ? format(formData.gioDat, 'HH:mm') : '';
      
      // Tính tổng số lượng khách
      const soLuongKhach = formData.soLuongNguoiLon + formData.soLuongTreEm;
      
      const payload = {
        ...formData,
        ngayDat,
        gioDat,
        soLuongKhach,
        trangThai: 'Chờ xác nhận'
      };
      
      // Gọi API tạo đặt bàn mới
      const response = await api.post('/order/dat-ban', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Tạo đặt bàn thành công',
          severity: 'success'
        });
        
        // Chuyển về trang danh sách đặt bàn
        setTimeout(() => {
          navigate('/admin/reservations');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Tạo đặt bàn không thành công');
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo đặt bàn:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi tạo đặt bàn',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Tạo đặt bàn mới
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Thông tin khách hàng */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin khách hàng
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Họ tên *"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.hoTen}
                helperText={errors.hoTen}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Số điện thoại *"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.soDienThoai}
                helperText={errors.soDienThoai}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            
            {/* Thông tin đặt bàn */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Thông tin đặt bàn
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.nhaHang}>
                <InputLabel>Nhà hàng *</InputLabel>
                <Select
                  name="nhaHang"
                  value={formData.nhaHang}
                  label="Nhà hàng *"
                  onChange={handleSelectChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <RestaurantIcon />
                    </InputAdornment>
                  }
                >
                  {restaurants.map((restaurant) => (
                    <MenuItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.nhaHang && (
                  <Typography color="error" variant="caption">
                    {errors.nhaHang}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày đặt bàn *"
                  value={formData.ngayDat}
                  onChange={(newValue) => setFormData({ ...formData, ngayDat: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.ngayDat,
                      helperText: errors.ngayDat
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Giờ đặt bàn *"
                  value={formData.gioDat}
                  onChange={(newValue) => setFormData({ ...formData, gioDat: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.gioDat,
                      helperText: errors.gioDat
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Số lượng người lớn */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                label="Số lượng người lớn"
                name="soLuongNguoiLon"
                value={formData.soLuongNguoiLon || ''}
                onChange={handleNumberChange}
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
                error={!!errors.soLuongNguoiLon}
                helperText={errors.soLuongNguoiLon}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Số lượng trẻ em */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Số lượng trẻ em"
                name="soLuongTreEm"
                value={formData.soLuongTreEm || ''}
                onChange={handleNumberChange}
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                error={!!errors.soLuongTreEm}
                helperText={errors.soLuongTreEm}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ChildCareIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Hiển thị tổng số khách */}
            <Grid item xs={12}>
              <Alert severity="info">
                Tổng số khách: <strong>{formData.soLuongNguoiLon + formData.soLuongTreEm} người</strong>
              </Alert>
            </Grid>
            
            {/* Ghi chú */}
            <Grid item xs={12}>
              <TextField
                label="Ghi chú"
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            
            {/* Nút submit */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/admin/reservations')}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Đang xử lý...' : 'Tạo đặt bàn'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
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
    </Box>
  );
};

export default NewReservationForm; 