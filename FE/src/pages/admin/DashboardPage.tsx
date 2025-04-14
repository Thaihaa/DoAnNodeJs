import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  LinearProgress,
  useTheme,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  PeopleAlt as PeopleAltIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  TableRestaurant as TableRestaurantIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Import services
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';

interface StatData {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  increase: string;
}

interface Order {
  id: string;
  customer: string;
  time: string;
  total: string;
  status: string;
}

interface Reservation {
  id: string;
  customer: string;
  time: string;
  date: string;
  guests: number;
  status: string;
}

interface MenuItem {
  name: string;
  count: number;
  percent: number;
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy thống kê từ API
        const statsResponse = await api.get('/admin/dashboard/stats');
        if (statsResponse.data && statsResponse.data.success) {
          const statsData = [
            {
              title: 'Người dùng',
              value: statsResponse.data.data.totalUsers.toString(),
              icon: <PeopleAltIcon />,
              color: theme.palette.primary.main,
              increase: statsResponse.data.data.userIncrease || '+0%'
            },
            {
              title: 'Đơn hàng',
              value: statsResponse.data.data.totalOrders.toString(),
              icon: <ShoppingCartIcon />,
              color: theme.palette.success.main,
              increase: statsResponse.data.data.orderIncrease || '+0%'
            },
            {
              title: 'Đặt bàn',
              value: statsResponse.data.data.totalReservations.toString(),
              icon: <TableRestaurantIcon />,
              color: theme.palette.warning.main,
              increase: statsResponse.data.data.reservationIncrease || '+0%'
            },
            {
              title: 'Doanh thu',
              value: formatPrice(statsResponse.data.data.totalRevenue || 0),
              icon: <TrendingUpIcon />,
              color: theme.palette.info.main,
              increase: statsResponse.data.data.revenueIncrease || '+0%'
            }
          ];
          setStats(statsData);
        } else {
          // Không có dữ liệu mặc định nếu API không trả về success
          setStats([]);
          setError('Không thể tải dữ liệu thống kê');
        }

        // Lấy đơn hàng gần đây
        const ordersResponse = await api.get('/admin/dashboard/recent-orders');
        if (ordersResponse.data && ordersResponse.data.success) {
          setRecentOrders(ordersResponse.data.data);
        } else {
          setRecentOrders([]);
        }

        // Lấy đặt bàn gần đây
        const reservationsResponse = await api.get('/admin/dashboard/recent-reservations');
        if (reservationsResponse.data && reservationsResponse.data.success) {
          setRecentReservations(reservationsResponse.data.data);
        } else {
          setRecentReservations([]);
        }

        // Lấy món ăn phổ biến
        const popularItemsResponse = await api.get('/admin/dashboard/popular-items');
        if (popularItemsResponse.data && popularItemsResponse.data.success) {
          setPopularItems(popularItemsResponse.data.data);
        } else {
          setPopularItems([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dashboard:', error);
        setLoading(false);
        setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
        setStats([]);
        setRecentOrders([]);
        setRecentReservations([]);
        setPopularItems([]);
      }
    };

    fetchDashboardData();
  }, [theme]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4} color="text.primary">
        Thống kê
      </Typography>

      {error && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', borderRadius: 2 }}>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}

      {/* Thống kê đơn giản */}
      {stats.length > 0 ? (
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  border: '1px solid',
                  borderColor: alpha(stat.color, 0.2),
                  '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(stat.color, 0.2)}`,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ width: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="text.primary">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {stat.increase}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(stat.color, 0.1),
                        color: stat.color,
                        width: 56,
                        height: 56
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : !error && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="body1" align="center" color="text.secondary">Không có dữ liệu thống kê</Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
      </Grid>

      {popularItems.length > 0 ? (
        <Box mb={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                <RestaurantIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Món ăn phổ biến
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={3}>
              {popularItems.map((item) => (
                <Box key={item.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight="medium" color="text.primary">
                      {item.name}
                    </Typography>
                    <Chip
                      label={`${item.count} đơn hàng`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.percent} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      '.MuiLinearProgress-bar': {
                        bgcolor: theme.palette.primary.main
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      ) : (
        <Box mb={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                <RestaurantIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Món ăn phổ biến
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Không có dữ liệu món ăn phổ biến
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage; 