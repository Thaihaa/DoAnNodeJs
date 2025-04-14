import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import EmailIcon from '@mui/icons-material/Email';

const SubscribeSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(true);
      setOpen(true);
      return;
    }
    
    // Here you would usually send the email to your backend
    console.log('Subscribing email:', email);
    
    // Show success message
    setError(false);
    setOpen(true);
    
    // Reset form
    setEmail('');
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Box sx={{ py: 8, bgcolor: '#f8f8f8' }}>
      <Container>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom>
              Đăng ký nhận tin khuyến mãi
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Hãy đăng ký email để nhận thông tin về các chương trình khuyến mãi mới nhất và các sự kiện đặc biệt của Manwah. Chúng tôi hứa sẽ không gửi spam!
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: 2
              }}
            >
              <TextField
                fullWidth
                label="Email của bạn"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                InputProps={{
                  startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{
                  height: 56,
                  whiteSpace: 'nowrap',
                  px: 4
                }}
              >
                Đăng ký ngay
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error 
            ? "Email không hợp lệ. Vui lòng kiểm tra lại." 
            : "Đăng ký thành công! Cảm ơn bạn đã quan tâm đến Manwah."}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubscribeSection; 