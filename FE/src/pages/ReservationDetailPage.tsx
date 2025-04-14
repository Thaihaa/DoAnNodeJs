import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ReservationDetailCard from '../components/customer/ReservationDetailCard';

const ReservationDetailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservation = location.state?.reservation;

  console.log('Reservation data:', reservation);

  if (!reservation) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Không tìm thấy thông tin đặt bàn
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/reservation')}
            sx={{ mt: 2 }}
          >
            Quay lại đặt bàn
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
      </Box>
      
      <ReservationDetailCard reservation={reservation} />
    </Container>
  );
};

export default ReservationDetailPage;