import React from 'react';
import { Box, Typography, Container, Card, CardContent, CardMedia, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
}

const locations: Location[] = [
  {
    id: 'location1',
    name: 'Manwah Vincom Center',
    address: 'Tầng 5, TTTM Vincom Center, 72 Lê Thánh Tôn, Q.1, TPHCM',
    phone: '028 3827 1718',
    image: '/manwah-vincom-center.jpg'
  },
  {
    id: 'location2',
    name: 'Manwah Aeon Mall Tân Phú',
    address: 'Tầng 3, TTTM AEON MALL Tân Phú, Q. Tân Phú, TPHCM',
    phone: '028 3605 1718',
    image: '/manwah-aeon-mall-tan-phu.jpg'
  },
  {
    id: 'location3',
    name: 'Manwah Royal City',
    address: 'Tầng B2, TTTM Royal City, 72A Nguyễn Trãi, Q. Thanh Xuân, Hà Nội',
    phone: '024 3974 8668',
    image: '/manwah-royal-city.jpg'
  },
  {
    id: 'location4',
    name: 'Manwah Times City',
    address: 'Tầng B1, TTTM Times City, 458 Minh Khai, Q. Hai Bà Trưng, Hà Nội',
    phone: '024 3632 1718',
    image: '/manwah-times-city.jpg'
  }
];

const LocationSection: React.FC = () => {
  return (
    <Box sx={{ py: 8, bgcolor: '#ffffff' }}>
      <Container>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          VỊ TRÍ NHÀ HÀNG
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 5 }}>
          Thưởng thức ẩm thực Đài Loan tại các nhà hàng Manwah trên toàn quốc
        </Typography>

        <Grid container spacing={4}>
          {locations.map((location) => (
            <Grid item key={location.id} xs={12} md={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={location.image}
                  alt={location.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {location.name}
                  </Typography>
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <LocationOnIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="small" />
                    <Typography variant="body2">{location.address}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PhoneIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="small" />
                    <Typography variant="body2">{location.phone}</Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small"
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(location.address)}`}
                    target="_blank"
                    sx={{ textTransform: 'none' }}
                  >
                    Xem bản đồ
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={4}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ textTransform: 'none' }}
          >
            Xem tất cả chi nhánh
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LocationSection; 