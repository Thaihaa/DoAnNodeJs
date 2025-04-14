import React, { useState, useEffect } from 'react';
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
  Link as MuiLink
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';

const LoginPage: React.FC = () => {
  const { login, loading, errorMessage, setErrorMessage } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [formError, setFormError] = useState({
    username: '',
    password: ''
  });

  // Reset error message when component unmounts
  useEffect(() => {
    return () => {
      setErrorMessage(null);
    };
  }, [setErrorMessage]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newFormError = {
      username: '',
      password: ''
    };

    if (!username.trim()) {
      newFormError.username = 'Vui lòng nhập tên đăng nhập';
      isValid = false;
    }

    if (!password) {
      newFormError.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      newFormError.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    setFormError(newFormError);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setErrorMessage(null);
    setIsSubmitting(true);
    setLoginAttempts(prev => prev + 1);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={8}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Đăng nhập
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Đăng nhập để đặt bàn, theo dõi đơn hàng và nhận nhiều ưu đãi hấp dẫn từ Manwah.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                  {errorMessage}
                  {loginAttempts > 1 && 
                    <Typography variant="body2" sx={{mt: 1}}>
                      Gợi ý: Kiểm tra kết nối mạng và đảm bảo thông tin đăng nhập chính xác
                    </Typography>
                  }
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Tên đăng nhập"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (formError.username) {
                      setFormError(prev => ({...prev, username: ''}));
                    }
                  }}
                  error={!!formError.username}
                  helperText={formError.username}
                  disabled={isSubmitting}
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
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError.password) {
                      setFormError(prev => ({...prev, password: ''}));
                    }
                  }}
                  error={!!formError.password}
                  helperText={formError.password}
                  disabled={isSubmitting}
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
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading || isSubmitting}
                  startIcon={<LoginIcon />}
                >
                  {(loading || isSubmitting) ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
                
                <Box mt={2} textAlign="center">
                  <MuiLink component="button" variant="body2" onClick={() => {}} sx={{ textDecoration: 'none' }}>
                    Quên mật khẩu?
                  </MuiLink>
                </Box>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hoặc
                  </Typography>
                </Divider>
                
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Bạn chưa có tài khoản?{' '}
                    <MuiLink component={Link} to="/dang-ky" sx={{ textDecoration: 'none' }}>
                      Đăng ký ngay
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

export default LoginPage; 