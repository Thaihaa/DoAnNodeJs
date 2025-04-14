import React from 'react';
import { Box, Typography, Container, Link, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        bgcolor: '#f5f5f5',
        pt: 6,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer */}
        <Grid container spacing={4}>
          {/* Logo và thông tin công ty */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#d32f2f',
                mb: 2,
              }}
            >
              MANWAH
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Chuỗi nhà hàng buffet lẩu Đài Loan được yêu thích nhất Việt Nam, với hơn 20 chi nhánh trên toàn quốc, phục vụ hơn 10.000 khách hàng mỗi ngày.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton aria-label="facebook" size="small" sx={{ color: '#3b5998' }}>
                <FacebookIcon />
              </IconButton>
              <IconButton aria-label="instagram" size="small" sx={{ color: '#e4405f' }}>
                <InstagramIcon />
              </IconButton>
              <IconButton aria-label="youtube" size="small" sx={{ color: '#ff0000' }}>
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Đường dẫn nhanh */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Liên kết
            </Typography>
            <Typography variant="body2">
              <Link href="/" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
                Trang chủ
              </Link>
            </Typography>
            <Typography variant="body2">
              <Link href="/thuc-don" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
                Thực đơn
              </Link>
            </Typography>
            <Typography variant="body2">
              <Link href="/uu-dai" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
                Ưu đãi
              </Link>
            </Typography>
            <Typography variant="body2">
              <Link href="/dat-ban" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
                Đặt bàn
              </Link>
            </Typography>
          </Grid>

          {/* Thông tin liên hệ */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Liên hệ
            </Typography>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
              <Typography variant="body2">
                Tầng 1, TTTM Vincom Center, 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TPHCM
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
              <Typography variant="body2">
                <Link href="tel:1900 1234" color="inherit" underline="hover">
                  1900 1234
                </Link>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
              <Typography variant="body2">
                <Link href="mailto:info@manwah.vn" color="inherit" underline="hover">
                  info@manwah.vn
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Tải App */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Tải App Golden SpoonS - Siêu ứng dụng cho tín đồ ẩm thực.
              <br />
              Tích điểm, đặt bàn và nhận ưu đãi độc quyền.
            </Typography>
          </Grid>

        </Grid>

        {/* Copyright */}
        <Box pt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Công ty Cổ phần Thực phẩm & Dịch vụ Golden SpoonS. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 