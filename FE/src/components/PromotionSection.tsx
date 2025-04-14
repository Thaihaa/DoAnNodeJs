import React from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';
import { getPromotions } from '../services/restaurantService';

const PromotionSection: React.FC = () => {
  const promotions = getPromotions();

  return (
    <Box sx={{ bgcolor: '#f9f9f9', py: 6 }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#333'
          }}
        >
          Khám phá ưu đãi
        </Typography>

        <Grid container spacing={4}>
          {promotions.map((promotion) => (
            <Grid item key={promotion.id} xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={promotion.imageUrl}
                  alt={promotion.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {promotion.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {promotion.description.length > 150 
                      ? `${promotion.description.substring(0, 150)}...` 
                      : promotion.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link} 
                    to={promotion.url} 
                    size="small" 
                    sx={{ 
                      color: '#d32f2f', 
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#9a0007',
                      }
                    }}
                  >
                    Xem thêm
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            component={Link}
            to="/uu-dai"
            variant="outlined"
            size="large"
            sx={{
              borderColor: '#d32f2f',
              color: '#d32f2f',
              fontWeight: 'bold',
              px: 4,
              '&:hover': {
                backgroundColor: '#f9e9e9',
                borderColor: '#9a0007',
              },
            }}
          >
            XEM TẤT CẢ ƯU ĐÃI
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PromotionSection; 