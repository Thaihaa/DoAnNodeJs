import React from 'react';
import { Box, Typography, Container, Grid, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

interface BuffetPriceProps {
  price: number;
}

const BuffetPrice: React.FC<BuffetPriceProps> = ({ price }) => (
  <Button
    variant="contained"
    sx={{
      backgroundColor: '#d32f2f',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '4px',
      px: 2,
      py: 0.5,
      '&:hover': {
        backgroundColor: '#9a0007',
      },
    }}
  >
    {price.toLocaleString('vi-VN')}
  </Button>
);

const Hero: React.FC = () => {
  const adultPrices = [269000, 329000, 419000, 499000];
  
  return (
    <Box
      sx={{
        backgroundImage: 'url(https://www.manwah.com.vn/images/banner-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        pt: 2,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Image */}
        <Box
          component="img"
          src="https://www.manwah.com.vn/images/banner-home.webp"
          alt="Manwah Banner"
          sx={{
            width: '100%',
            height: 'auto',
            mb: 4,
            borderRadius: '12px',
          }}
        />

        {/* Buffet Pricing */}
        <Grid container spacing={3}>
          {/* Buffet Người Lớn */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                p: 3,
                borderRadius: '8px',
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  color: '#d32f2f',
                  fontWeight: 'bold',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                BUFFET NGƯỜI LỚN
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {adultPrices.map((price, index) => (
                  <BuffetPrice key={index} price={price} />
                ))}
              </Box>
            </Paper>
          </Grid>
          
          {/* Buffet Trẻ Em */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                p: 3,
                borderRadius: '8px',
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  color: '#d32f2f',
                  fontWeight: 'bold',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                BUFFET TRẺ EM
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    px: 2,
                    py: 0.5,
                    '&:hover': {
                      backgroundColor: '#9a0007',
                    },
                  }}
                >
                  FREE (DƯỚI 1M)
                </Button>
                
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    px: 2,
                    py: 0.5,
                    '&:hover': {
                      backgroundColor: '#9a0007',
                    },
                  }}
                >
                  40% (1-1.3M)
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Buffet Note */}
        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            color: '#333',
            fontWeight: 'medium',
            mt: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            p: 2,
            borderRadius: '4px',
          }}
        >
          THƯỞNG THỨC KHÔNG GIỚI HẠN HƠN 50 LOẠI ĐỒ UỐNG & TRÁNG MIỆNG CHỈ TỪ 39,000 VND
        </Typography>

        {/* Book Table Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            component={Link}
            to="/dat-ban"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#d32f2f',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: '#9a0007',
              },
            }}
          >
            ĐẶT BÀN NGAY
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero; 