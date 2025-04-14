import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useCart, CartItem } from '../contexts/CartContext';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';

// Interfaces cho dữ liệu API
interface LoaiMonAn {
  _id: string;
  tenLoai: string;
  moTa: string;
  thuTu: number;
}

interface MonAn {
  _id: string;
  tenMon: string;
  moTa: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  loaiMonAn: string | LoaiMonAn;
  noiBat: boolean;
}

const MenuPage: React.FC = () => {
  const [categories, setCategories] = useState<LoaiMonAn[]>([]);
  const [menuItems, setMenuItems] = useState<MonAn[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { addItem } = useCart();

  // Fetch loại món ăn
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/loai-mon-an`);
        if (!response.ok) {
          throw new Error('Không thể tải danh sách loại món ăn');
        }
        const data = await response.json();
        if (data.success && data.data) {
          const sortedCategories = data.data.sort((a: LoaiMonAn, b: LoaiMonAn) => a.thuTu - b.thuTu);
          setCategories(sortedCategories);
          // Chọn loại đầu tiên nếu có
          if (sortedCategories.length > 0) {
            setSelectedCategory(sortedCategories[0]._id);
          }
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi tải danh sách loại món ăn');
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch món ăn theo loại
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        console.log('Đang tải danh sách món ăn từ loại:', selectedCategory);
        const response = await fetch(`${API_URL}/mon-an?loaiMonAn=${selectedCategory}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Lỗi API:', response.status, errorText);
          throw new Error(`Không thể tải danh sách món ăn: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          console.log('Nhận được dữ liệu món ăn:', data.data.length, 'món');
          setMenuItems(data.data);
        } else {
          console.error('Dữ liệu không đúng định dạng:', data);
          setError('Dữ liệu không đúng định dạng');
        }
      } catch (error: any) {
        setError(`Đã xảy ra lỗi khi tải danh sách món ăn: ${error.message}`);
        console.error('Error fetching menu items:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = (item: MonAn) => {
    const cartItem: CartItem = {
      id: item._id,
      name: item.tenMon,
      price: item.giaKhuyenMai || item.gia,
      quantity: 1,
      image: item.hinhAnh.length > 0 ? item.hinhAnh[0] : ''
    };
    
    addItem(cartItem);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  // Tìm tên danh mục hiện tại
  const currentCategory = categories.find(cat => cat._id === selectedCategory)?.tenLoai || '';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <MuiLink component={Link} to="/" color="inherit">
          Trang chủ
        </MuiLink>
        <MuiLink component={Link} to="/thuc-don" color="inherit">
          Thực đơn
        </MuiLink>
        <Typography color="text.primary">{currentCategory}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        Món lẻ
      </Typography>

      <Grid container spacing={3}>
        {/* Sidebar - Danh mục */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={1} 
            sx={{ 
              mb: 2,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <List component="nav" aria-label="danh mục món ăn" disablePadding>
              {categories.map((category) => (
                <React.Fragment key={category._id}>
                  <ListItem disablePadding>
                    <ListItemButton 
                      selected={selectedCategory === category._id}
                      onClick={() => handleCategoryChange(category._id)}
                      sx={{
                        bgcolor: selectedCategory === category._id ? 'primary.light' : 'inherit',
                        '&:hover': {
                          bgcolor: selectedCategory === category._id ? 'primary.light' : 'action.hover',
                        },
                      }}
                    >
                      <ListItemText primary={category.tenLoai} />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content - Danh sách món ăn */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : menuItems.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>Không có món ăn nào trong danh mục này</Alert>
          ) : (
            <Grid container spacing={3}>
              {menuItems.map((item) => (
                <Grid item key={item._id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.hinhAnh.length > 0 
                        ? item.hinhAnh[0] 
                        : '/placeholder-food.jpg'}
                      alt={item.tenMon}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, pb: 1, pt: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {item.tenMon}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
                        {item.moTa && item.moTa.length > 100 
                          ? `${item.moTa.substring(0, 100)}...` 
                          : item.moTa}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          {formatPrice(item.gia)}
                        </Typography>
                        <Button 
                          variant="contained" 
                          size="small"
                          startIcon={<AddShoppingCartIcon />}
                          onClick={() => handleAddToCart(item)}
                        >
                          Thêm
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Đã thêm món ăn vào giỏ hàng!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MenuPage; 