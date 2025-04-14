import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Divider,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    setSnackbarMessage('Đã xóa món khỏi giỏ hàng');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      setSnackbarMessage('Giỏ hàng trống. Vui lòng thêm món ăn trước khi thanh toán.');
      setSnackbarOpen(true);
      return;
    }
    // Chuyển đến trang thanh toán
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <Box sx={{ py: 5 }}>
      <Container>
        <Button 
          component={Link} 
          to="/thuc-don"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 4 }}
        >
          Tiếp tục mua sắm
        </Button>
        
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Giỏ hàng của bạn
        </Typography>

        {items.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" gutterBottom>
              Giỏ hàng của bạn đang trống
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Hãy thêm một số món ăn từ thực đơn của chúng tôi
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/thuc-don"
              size="large"
            >
              Xem thực đơn
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                {items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <Box sx={{ p: 3, display: 'flex' }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                        image={item.image}
                        alt={item.name}
                      />
                      <CardContent sx={{ flex: '1 1 auto', pl: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="h6" gutterBottom>
                            {item.name}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label="Xóa món"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {formatPrice(item.price)}
                        </Typography>
                        
                        <Box display="flex" alignItems="center">
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Giảm số lượng"
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          
                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value);
                              if (!isNaN(newValue)) {
                                handleQuantityChange(item.id, newValue);
                              }
                            }}
                            inputProps={{ 
                              min: 1, 
                              style: { textAlign: 'center' },
                              'aria-label': 'Số lượng'
                            }}
                            sx={{ width: 60, mx: 1 }}
                          />
                          
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            aria-label="Tăng số lượng"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                          
                          <Typography variant="body1" sx={{ ml: 'auto', fontWeight: 'bold' }}>
                            {formatPrice(item.price * item.quantity)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Box>
                    {index < items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Card>
              
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={clearCart}
                >
                  Xóa tất cả
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tổng giỏ hàng
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Tạm tính:</Typography>
                  <Typography variant="body1">{formatPrice(totalPrice)}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Phí giao hàng:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tính khi thanh toán
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" mb={3}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                  <Typography variant="h6" color="primary">{formatPrice(totalPrice)}</Typography>
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  onClick={handleCheckout}
                >
                  Tiến hành thanh toán
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  * Giá đã bao gồm thuế VAT
                </Typography>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage; 