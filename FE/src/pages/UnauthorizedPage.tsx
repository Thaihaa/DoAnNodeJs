import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';
import HomeIcon from '@mui/icons-material/Home';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          minHeight: '70vh'
        }}
      >
        <BlockIcon color="error" sx={{ fontSize: 100, mb: 4 }} />
        
        <Typography variant="h3" gutterBottom>
          Không có quyền truy cập
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên 
          hoặc đăng nhập bằng tài khoản có quyền phù hợp.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button 
            startIcon={<HomeIcon />}
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            onClick={() => navigate('/dang-nhap')}
          >
            Đăng nhập lại
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage; 