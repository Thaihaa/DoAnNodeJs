import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Paper,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Divider,
  InputAdornment,
  Checkbox,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { vi } from 'date-fns/locale';
import { getManwahLocations } from '../services/restaurantService';
import { createReservation } from '../services/reservationService';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PaymentIcon from '@mui/icons-material/Payment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MomoPaymentModal from '../components/payment/MomoPaymentModal';

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const locations = getManwahLocations();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [formState, setFormState] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    nhaHang: '',
    soLuongKhach: 2,
    ghiChu: '',
    buffetNguoiLon: '269.000',
    buffetTreEm: 'FREE',
    soLuongNguoiLon: 2,
    soLuongTreEm: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // State cho thanh toán
  const [datBanId, setDatBanId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [payNow, setPayNow] = useState<boolean>(false);

  const buffetNguoiLonOptions = [
    { value: '269.000', label: '269.000' },
    { value: '329.000', label: '329.000' },
    { value: '419.000', label: '419.000' },
    { value: '499.000', label: '499.000' },
  ];

  const buffetTreEmOptions = [
    { value: 'FREE', label: 'MIỄN PHÍ (DƯỚI 1M)' },
    { value: '40%', label: '40% (1-1.3M)' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ tên';
    }
    
    if (!formState.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formState.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
    }
    
    if (formState.email && !/^\S+@\S+\.\S+$/.test(formState.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formState.nhaHang) {
      newErrors.nhaHang = 'Vui lòng chọn nhà hàng';
    }
    
    if (!selectedDate) {
      newErrors.ngayDat = 'Vui lòng chọn ngày đặt bàn';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.ngayDat = 'Ngày đặt bàn phải từ hôm nay trở đi';
      }
    }
    
    if (!selectedTime) {
      newErrors.gioDat = 'Vui lòng chọn giờ đặt bàn';
    }
    
    if (formState.soLuongNguoiLon < 1) {
      newErrors.soLuongNguoiLon = 'Số lượng người lớn phải ít nhất là 1';
    }
    
    if (formState.soLuongNguoiLon + formState.soLuongTreEm < 1) {
      newErrors.soLuongKhach = 'Tổng số khách phải lớn hơn 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho các trường số
    if (name === 'soLuongNguoiLon' || name === 'soLuongTreEm') {
      // Đảm bảo giá trị là số
      const numValue = parseInt(value);
      // Chỉ cập nhật nếu là số hợp lệ
      if (!isNaN(numValue)) {
        setFormState({
          ...formState,
          [name]: numValue, // Lưu dưới dạng số
        });
      }
    } else {
      // Xử lý bình thường cho các trường khác
      setFormState({
        ...formState,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayNow(e.target.checked);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Format date and time
      const ngayDat = selectedDate!.toISOString().split('T')[0];
      const hours = selectedTime!.getHours().toString().padStart(2, '0');
      const minutes = selectedTime!.getMinutes().toString().padStart(2, '0');
      const gioDat = `${hours}:${minutes}`;
      
      // Tính tổng số khách
      const soLuongNguoiLon = Number(formState.soLuongNguoiLon);
      const soLuongTreEm = Number(formState.soLuongTreEm);
      const soLuongKhach = soLuongNguoiLon + soLuongTreEm;

      // Tính tiền đặt cọc (50% giá buffet người lớn)
      const giaBuffet = parseInt(formState.buffetNguoiLon.replace(/\./g, ''));
      const tongTien = (giaBuffet * soLuongNguoiLon) * 0.5;
      
      // Prepare data
      const data = {
        ...formState,
        ngayDat,
        gioDat,
        soLuongKhach,
        soLuongNguoiLon,
        soLuongTreEm,
        tongTien,
        trangThai: 'Chờ xác nhận',
      };
      
      // Call API để tạo đơn đặt bàn
      const response = await createReservation(data as any);
      
      if (response.success && response.data) {
        const createdId = response.data._id;
        
        // Nếu người dùng chọn thanh toán ngay
        if (payNow) {
          setDatBanId(createdId);
          setPaymentAmount(tongTien);
          setShowPaymentModal(true);
        } else {
          // Nếu không thanh toán ngay, chuyển về trang chi tiết đặt bàn
          setSnackbar({
            open: true,
            message: 'Đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận.',
            severity: 'success',
          });
          
          navigate('/reservation-detail', {
            state: { reservation: { ...data, _id: createdId } },
          });
          
          // Reset form
          setFormState({
            hoTen: '',
            soDienThoai: '',
            email: '',
            nhaHang: '',
            soLuongKhach: 2,
            ghiChu: '',
            buffetNguoiLon: '269.000',
            buffetTreEm: 'FREE',
            soLuongNguoiLon: 2,
            soLuongTreEm: 0,
          });
          setSelectedDate(null);
          setSelectedTime(null);
          setPayNow(false);
        }
      }
    } catch (error) {
      // Show error message
      setSnackbar({
        open: true,
        message: 'Đã xảy ra lỗi khi đặt bàn. Vui lòng thử lại sau.',
        severity: 'error',
      });
    }
  };

  const handlePaymentSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Thanh toán thành công! Đơn đặt bàn của bạn đã được xác nhận.',
      severity: 'success',
    });
    
    // Chuyển về trang chi tiết đặt bàn
    navigate('/reservation-detail', {
      state: { 
        reservation: { 
          ...formState, 
          _id: datBanId,
          ngayDat: selectedDate!.toISOString().split('T')[0],
          gioDat: `${selectedTime!.getHours().toString().padStart(2, '0')}:${selectedTime!.getMinutes().toString().padStart(2, '0')}`,
          soLuongKhach: Number(formState.soLuongNguoiLon) + Number(formState.soLuongTreEm),
          tongTien: parseInt(formState.buffetNguoiLon.replace(/\./g, '')) * Number(formState.soLuongNguoiLon) * 0.5,
          trangThai: 'Đã thanh toán'
        } 
      },
    });
    
    // Reset form
    setFormState({
      hoTen: '',
      soDienThoai: '',
      email: '',
      nhaHang: '',
      soLuongKhach: 2,
      ghiChu: '',
      buffetNguoiLon: '269.000',
      buffetTreEm: 'FREE',
      soLuongNguoiLon: 2,
      soLuongTreEm: 0,
    });
    setSelectedDate(null);
    setSelectedTime(null);
    setPayNow(false);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Tính tổng tiền đặt cọc trước
  const calculateDeposit = () => {
    const giaBuffet = parseInt(formState.buffetNguoiLon.replace(/\./g, ''));
    const depositAmount = (giaBuffet * formState.soLuongNguoiLon) * 0.5;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(depositAmount);
  };

  return (
    <Box sx={{ py: 6, bgcolor: '#f9f9f9' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 4 }}
        >
          Đặt bàn
        </Typography>

        <Grid container spacing={4}>
          {/* Form */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, borderRadius: '8px' }}>
              <Typography variant="h6" gutterBottom>
                Thông tin đặt bàn
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Họ tên *"
                      name="hoTen"
                      value={formState.hoTen}
                      onChange={handleChange}
                      error={!!errors.hoTen}
                      helperText={errors.hoTen}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại *"
                      name="soDienThoai"
                      value={formState.soDienThoai}
                      onChange={handleChange}
                      error={!!errors.soDienThoai}
                      helperText={errors.soDienThoai}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.nhaHang}>
                      <InputLabel>Chọn nhà hàng *</InputLabel>
                      <Select
                        name="nhaHang"
                        value={formState.nhaHang}
                        label="Chọn nhà hàng *"
                        onChange={handleSelectChange}
                      >
                        {locations.map((location) => (
                          <MenuItem key={location.id} value={location.id}>
                            {location.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.nhaHang && (
                        <Typography variant="caption" color="error">
                          {errors.nhaHang}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Ngày đặt bàn *"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
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
                  
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="Giờ đặt bàn *"
                        value={selectedTime}
                        onChange={(newValue) => setSelectedTime(newValue)}
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
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" color="primary" gutterBottom>
                      Chọn gói Buffet
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      BUFFET NGƯỜI LỚN
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        name="buffetNguoiLon"
                        value={formState.buffetNguoiLon}
                        onChange={handleChange}
                        row
                      >
                        <FormControlLabel
                          value="269.000"
                          control={<Radio />}
                          label="269.000 VND"
                        />
                        <FormControlLabel
                          value="329.000"
                          control={<Radio />}
                          label="329.000 VND"
                        />
                        <FormControlLabel
                          value="419.000"
                          control={<Radio />}
                          label="419.000 VND"
                        />
                        <FormControlLabel
                          value="499.000"
                          control={<Radio />}
                          label="499.000 VND"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số lượng người lớn *"
                      name="soLuongNguoiLon"
                      type="number"
                      value={formState.soLuongNguoiLon}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                        inputProps: { min: 1 }
                      }}
                      error={!!errors.soLuongNguoiLon}
                      helperText={errors.soLuongNguoiLon}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      BUFFET TRẺ EM
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        name="buffetTreEm"
                        value={formState.buffetTreEm}
                        onChange={handleChange}
                        row
                      >
                        <FormControlLabel
                          value="FREE"
                          control={<Radio />}
                          label="MIỄN PHÍ (DƯỚI 1M)"
                        />
                        <FormControlLabel
                          value="40%"
                          control={<Radio />}
                          label="40% (1-1.3M)"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số lượng trẻ em"
                      name="soLuongTreEm"
                      type="number"
                      value={formState.soLuongTreEm}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ChildCareIcon />
                          </InputAdornment>
                        ),
                        inputProps: { min: 0 }
                      }}
                      error={!!errors.soLuongTreEm}
                      helperText={errors.soLuongTreEm}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Tổng số khách: <strong>{Number(formState.soLuongNguoiLon) + Number(formState.soLuongTreEm)} người</strong>
                        {errors.soLuongKhach && (
                          <Typography color="error" variant="body2">
                            {errors.soLuongKhach}
                          </Typography>
                        )}
                      </Typography>
                    </Alert>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      THƯỞNG THỨC KHÔNG GIỚI HẠN HƠN 50 LOẠI ĐỒ UỐNG & TRÁNG MIỆNG CHỈ TỪ 39.000 VND
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" color="primary" gutterBottom>
                      <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Thanh toán
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Tiền đặt cọc (50% giá buffet người lớn): {calculateDeposit()}
                      </Typography>
                    </Alert>
                    
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={payNow}
                          onChange={handleCheckboxChange}
                          icon={<MonetizationOnIcon />}
                          checkedIcon={<MonetizationOnIcon />}
                        />
                      }
                      label="Thanh toán ngay qua MoMo"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú"
                      name="ghiChu"
                      multiline
                      rows={4}
                      value={formState.ghiChu}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        fontSize: '1rem',
                        textTransform: 'none'
                      }}
                    >
                      Đặt bàn
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          {/* Info */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, borderRadius: '8px', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Hướng dẫn đặt bàn
              </Typography>
              
              <Typography variant="body1" paragraph>
                Để đặt bàn tại nhà hàng Manwah, vui lòng điền đầy đủ thông tin vào form bên cạnh. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận.
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>Lưu ý:</strong>
              </Typography>
              
              <ul>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Vui lòng đặt bàn trước ít nhất 2 giờ
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Đối với nhóm trên 10 người, khuyến khích đặt trước 1 ngày
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Thời gian giữ bàn là 15 phút kể từ giờ đã đặt
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Nếu có thay đổi hoặc hủy đặt, vui lòng thông báo trước ít nhất 1 giờ
                </Typography>
              </ul>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Liên hệ hỗ trợ:</strong>
                </Typography>
                <Typography variant="body2">
                  Hotline: 1900 1234
                </Typography>
                <Typography variant="body2">
                  Email: info@manwah.vn
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Modal thanh toán MoMo */}
      <MomoPaymentModal
        open={showPaymentModal}
        onClose={handleClosePaymentModal}
        datBanId={datBanId}
        onPaymentSuccess={handlePaymentSuccess}
        amount={paymentAmount}
      />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default ReservationPage; 