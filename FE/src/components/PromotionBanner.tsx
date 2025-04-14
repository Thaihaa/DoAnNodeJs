import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const PromotionBanner: React.FC = () => {
  return (
    <Box>
      {/* Banner chính */}
      <Box sx={{ width: '100%' }}>
        <img 
          src="/banner.png" 
          alt="Manwah Banner" 
          style={{ 
            width: '100%', 
            maxHeight: '600px',
            height: 'auto', 
            objectFit: 'contain', 
            display: 'block' 
          }}
        />
      </Box>

      {/* Phần giá buffet */}
      <Box sx={{ backgroundColor: 'white', py: 3, borderBottom: '1px solid #eee' }}>
        <Container maxWidth="lg">
          <Grid container justifyContent="center" alignItems="center" spacing={2}>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    color: '#d32f2f', 
                    fontWeight: 'bold', 
                    mb: 2,
                    fontSize: { xs: '1.5rem', md: '2rem' }
                  }}
                >
                  BUFFET NGƯỜI LỚN
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 1,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}
                >
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: '80px', 
                      fontSize: '0.9rem',
                      borderRadius: '4px',
                      py: 1
                    }}
                  >
                    269.000
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: '80px', 
                      fontSize: '0.9rem',
                      borderRadius: '4px',
                      py: 1
                    }}
                  >
                    329.000
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: '80px', 
                      fontSize: '0.9rem',
                      borderRadius: '4px',
                      py: 1
                    }}
                  >
                    419.000
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: '80px', 
                      fontSize: '0.9rem',
                      borderRadius: '4px',
                      py: 1
                    }}
                  >
                    499.000
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    color: '#d32f2f', 
                    fontWeight: 'bold', 
                    mb: 2,
                    fontSize: { xs: '1.5rem', md: '2rem' }
                  }}
                >
                  BUFFET TRẺ EM
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 2
                  }}
                >
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: '140px', 
                      fontSize: '0.9rem',
                      borderRadius: '4px',
                      py: 1
                    }}
                  >
                    FREE (DƯỚI 1M)
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ 
                      fontWeight: 'bold', 
                      minWidth: '140px', 
                      fontSize: '0.9rem',
                      borderRadius: '4px',
                      py: 1
                    }}
                  >
                    40% (1-1.3M)
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Typography 
            variant="body1"
            align="center"
            sx={{ 
              fontWeight: 'medium', 
              mt: 3, 
              mb: 1, 
              letterSpacing: 0.5, 
              fontSize: '0.9rem',
              color: '#333'
            }}
          >
            THƯỞNG THỨC KHÔNG GIỚI HẠN HƠN 50 LOẠI ĐỒ UỐNG & TRÁNG MIỆNG CHỈ TỪ 39.000 VND
          </Typography>
        </Container>
      </Box>

      {/* Thông tin lẩu Đài Loan */}
      <Box sx={{ py: 6, backgroundColor: '#f9f9f9', mb: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ fontWeight: 'bold', mb: 2 }}
              >
                Lẩu Đài Loan
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 3, color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
                Sau hàng trăm năm tồn tại trong cuộc sống người Đài, lẩu Đài Loan không chỉ đơn thuần là sự kết hợp của các nguyên liệu quen thuộc, mà liên tục được cải tiến và hoàn thiện, từ thế hệ này sang thế hệ khác. Thực khách đến Manwah sẽ được tự mình khám phá hành trình ẩm thực đặc sắc với nước lẩu ngọt vị tự nhiên, kết hợp hầm cùng các loại gia vị đầy mùi thơm đặc trưng của Đài Loan.
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 3, color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
                Nét đặc sắc không chỉ đến từ nước lẩu, mà còn đến từ cả những món nguyên liệu Đài – bạn sẽ tìm thấy nhiều hơn là chả thịt bò và các loại rau thơm. Chính sự kết hợp các nguyên liệu, món ăn hài hòa sẽ tạo nên hương vị lẩu Đài Loan trứ mị và tinh tế.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                <Button 
                  component={Link}
                  to="/thuc-don"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: '#d32f2f', 
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                >
                  Xem thực đơn
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '550px',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '4px',
                      mb: 5
                    }}
                  >
                    <img 
                      src="/lau1.jpg" 
                      alt="Lẩu Đài Loan" 
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '550px',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '4px',
                      mb: 5
                    }}
                  >
                    <img 
                      src="/lau2.jpg" 
                      alt="Lẩu Đài Loan" 
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Hành trình văn đằm */}
      <Box sx={{ py: 6, backgroundColor: 'white', mb: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ fontWeight: 'bold', mb: 2 }}
              >
                Hành trình vạn dặm – Manwah đến Lê Thái Tổ
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 3, color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
                Đất pháp tương phản trong mọi yếu tố thiết kế – từ màu sắc tới họa tiết hay ánh sáng... Manwah Lễ Thái Tổ mang đậm âm hưởng Đài Loan truyền thống nhưng cũng thật phong khoáng, vừa trang nhã lại không kém phần mỹ lệ, thân thuộc và cũng đầy khác biệt.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                <Button 
                  component={Link}
                  to="/uu-dai/hanh-trinh-van-dam"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: '#d32f2f', 
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                >
                  Xem thêm
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '300px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '4px'
                }}
              >
                <img 
                  src="https://cmsbrandwebsites.ggg.com.vn/wp-content/uploads/2022/10/manwah-hanh-trinh-van-dam-hn.jpg" 
                  alt="Manwah Lê Thái Tổ" 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* The New Manwah */}
      <Box sx={{ py: 6, backgroundColor: '#f9f9f9', mb: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ fontWeight: 'bold', mb: 2 }}
              >
                The New Manwah - New Identity
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 3, color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
                <span style={{ color: '#ff4081', fontWeight: 'bold' }}>■</span> Lẩu Đài nguyên bản, nhưng không kém phần trẻ trung và hội nhập! Không tự giới hạn mình trong phạm vi ẩm thực, Manwah luôn muốn đan cài các yếu tố văn hóa vào thưởng hiệu. Lần "đích chuyến" này, <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Manwah</span> xích lại gần đời sống của khách hàng hơn! Bạn có thể thấy những màu sắc, hoa văn, nguồn cảm hứng rất gần gũi, mà bạn đã gặp ở đâu đó trong các bộ phim Đài Loan tuổi thơ hay những hình ảnh đặc trưng của đất nước này. Một hành trình mới những tâm ý không đổi, hi vọng rằng bạn sẽ luôn cảm thấy mình trong Manwah nhé!
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                <Button 
                  component="a"
                  href="https://www.youtube.com/watch?v=tsvpW_-oxm8"
                  target="_blank"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: '#d32f2f', 
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                >
                  Xem video
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '400px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '4px'
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/tsvpW_-oxm8" 
                  title="The New Manwah - New Identity"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Thương hiệu */}
      <Box sx={{ py: 6, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid item xs={12} md={8}>
              <Box>
                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  HOTPOT
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 4, gap: 3 }}>
                  <img src="https://manwah.com.vn/images/brand_logo/white/hotpot_ashima.svg" alt="Douhua" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/hotpot_kichi.svg" alt="Kitchen W" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/manwah-list.svg" alt="Manwah" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/hotpot_hutong.svg" alt="Hutong" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/hotpot_ktop.svg" alt="KTop" height={30} />
                </Box>

                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  BBQ
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 4, gap: 3 }}>
                  <img src="https://manwah.com.vn/images/brand_logo/white/bbq_sumo.svg" alt="Sumo" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/gogi-list.svg" alt="Gogi" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/bbq_gogisteak.svg" alt="Gogi Steak" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/kpub-list.jpg" alt="KPub" height={40} />
                </Box>

                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  JAPANESE
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 4, gap: 3 }}>
                  <img src="https://manwah.com.vn/images/brand_logo/white/japan_isushi.svg" alt="iSushi" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/japan_shogun.svg" alt="Sozai" height={50} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/japan_daruma.svg" alt="Daruma" height={50} />
                </Box>

                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  STEAKHOUSE
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 4, gap: 3 }}>
                  <img src="https://manwah.com.vn/images/brand_logo/white/woomaster.svg" alt="Woomaster" height={45} />
                </Box>

                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  WESTERN
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 4, gap: 3 }}>
                  <img src="https://manwah.com.vn/images/brand_logo/white/wester_cowboy_jack.svg" alt="Cowboy Jacks" height={45} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/vuvu.svg" alt="Vuvuzela" height={45} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/union_pizza.svg" alt="Jumbo" height={45} />
                </Box>

                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  DELIVERY
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 4, gap: 3 }}>
                  <img src="https://manwah.com.vn/images/brand_logo/white/other_icook.svg" alt="iCook" height={45} />
                  <img src="https://manwah.com.vn/images/brand_logo/white/gdeli.svg" alt="gDeli" height={45} />
                </Box>

                
              </Box>
            </Grid>
            

          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default PromotionBanner; 