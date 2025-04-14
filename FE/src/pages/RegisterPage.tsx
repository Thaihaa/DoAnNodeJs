import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  Grid, 
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Link as MuiLink,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const steps = ['Thông tin tài khoản', 'Thông tin cá nhân', 'Hoàn tất'];

const RegisterPage: React.FC = () => {
  const { register, loading, errorMessage, setErrorMessage } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    address: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formError, setFormError] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateStep1 = (): boolean => {
    let isValid = true;
    const errors = { ...formError };

    // Validate username
    if (!formData.username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const validateStep2 = (): boolean => {
    let isValid = true;
    const errors = { ...formError };

    // Validate fullName
    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
      isValid = false;
    }

    // Validate phoneNumber (optional but validate format if provided)
    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) return;
    if (activeStep === 1 && !validateStep2()) return;
    
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1() || !validateStep2()) {
      return;
    }
    
    setErrorMessage(null);
    
    try {
      // Đảm bảo đủ dữ liệu
      if (!formData.username || !formData.email || !formData.password) {
        setErrorMessage('Vui lòng nhập đầy đủ thông tin tài khoản');
        return;
      }
      
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber?.trim() || '',
        address: formData.address?.trim() || ''
      };
      
      console.log('Gửi yêu cầu đăng ký:', {...userData, password: '*****'});
      const success = await register(userData);
      
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      setErrorMessage('Lỗi khi đăng ký, vui lòng thử lại sau');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              error={!!formError.username}
              helperText={formError.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formError.email}
              helperText={formError.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formError.password}
              helperText={formError.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formError.confirmPassword}
              helperText={formError.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Họ tên"
              name="fullName"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              error={!!formError.fullName}
              helperText={formError.fullName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="phoneNumber"
              label="Số điện thoại"
              name="phoneNumber"
              autoComplete="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={!!formError.phoneNumber}
              helperText={formError.phoneNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="address"
              label="Địa chỉ"
              name="address"
              autoComplete="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={2}
              error={!!formError.address}
              helperText={formError.address}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 2:
        return (
          <Box py={2}>
            <Typography variant="h6" gutterBottom>
              Xác nhận thông tin
            </Typography>
            
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Tên đăng nhập:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.username}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Họ tên:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.fullName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Số điện thoại:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.phoneNumber || 'Chưa cung cấp'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Địa chỉ:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.address || 'Chưa cung cấp'}</Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="body2" color="text.secondary" mb={2}>
              Bằng việc nhấn nút "Đăng ký", bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={6}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Đăng ký
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Tạo tài khoản để đặt bàn, theo dõi đơn hàng và nhận nhiều ưu đãi hấp dẫn từ Manwah.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                  {errorMessage}
                </Alert>
              )}
              
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Box component="form" noValidate>
                {renderStepContent(activeStep)}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0 || loading}
                    startIcon={<ArrowBackIcon />}
                  >
                    Quay lại
                  </Button>
                  
                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={<HowToRegIcon />}
                    >
                      {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={loading}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Tiếp theo
                    </Button>
                  )}
                </Box>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hoặc
                  </Typography>
                </Divider>
                
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Bạn đã có tài khoản?{' '}
                    <MuiLink component={Link} to="/dang-nhap" sx={{ textDecoration: 'none' }}>
                      Đăng nhập ngay
                    </MuiLink>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RegisterPage; 