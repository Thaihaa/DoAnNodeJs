import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { checkPaymentStatus } from '../services/paymentService';

const PaymentCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState<string>('Đang xử lý thanh toán của bạn...');
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderIdParam = params.get('orderId');
    const resultCodeParam = params.get('resultCode');
    const messageParam = params.get('message');

    if (orderIdParam) {
      setOrderId(orderIdParam);

      // Nếu có resultCode từ MoMo, xử lý ngay
      if (resultCodeParam) {
        if (resultCodeParam === '0') {
          setStatus('success');
          setMessage('Thanh toán thành công! Đơn đặt bàn của bạn đã được xác nhận.');
          setLoading(false);
        } else {
          setStatus('error');
          setMessage(messageParam || 'Thanh toán thất bại. Vui lòng thử lại sau.');
          setLoading(false);
        }
      } else {
        // Nếu không có resultCode, kiểm tra trạng thái thanh toán từ server
        checkPaymentStatusFromServer(orderIdParam);
      }
    } else {
      // Không có orderId, chuyển hướng về trang chủ
      navigate('/');
    }
  }, [location, navigate]);

  const checkPaymentStatusFromServer = async (orderId: string) => {
    try {
      const response = await checkPaymentStatus(orderId);
      
      if (response.success && response.data) {
        if (response.data.trangThai === 'success') {
          setStatus('success');
          setMessage('Thanh toán thành công! Đơn đặt bàn của bạn đã được xác nhận.');
        } else if (response.data.trangThai === 'failed' || response.data.trangThai === 'cancelled') {
          setStatus('error');
          setMessage('Thanh toán thất bại hoặc đã bị hủy. Vui lòng thử lại sau.');
        } else {
          setStatus('pending');
          setMessage('Đơn hàng của bạn đang được xử lý. Vui lòng chờ trong giây lát.');
        }
      } else {
        setStatus('error');
        setMessage('Không thể xác nhận trạng thái thanh toán. Vui lòng liên hệ nhà hàng.');
      }
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
      setStatus('error');
      setMessage('Đã xảy ra lỗi khi kiểm tra trạng thái thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToHomePage = () => {
    navigate('/');
  };

  const handleGoToBookings = () => {
    navigate('/account/bookings');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Đang xử lý...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            {status === 'success' ? (
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80 }} />
            ) : (
              <ErrorOutlineIcon color="error" sx={{ fontSize: 80 }} />
            )}
            
            <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
              {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </Typography>
            
            <Alert 
              severity={status === 'success' ? 'success' : 'error'} 
              sx={{ mt: 3, fontSize: '1rem' }}
            >
              {message}
            </Alert>
            
            {orderId && (
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                Mã giao dịch: {orderId}
              </Typography>
            )}
            
            <Divider sx={{ my: 4 }} />
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
            >
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={handleGoToHomePage}
              >
                Về trang chủ
              </Button>
              
              {status === 'success' && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handleGoToBookings}
                >
                  Xem đơn đặt bàn của tôi
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentCallbackPage; 