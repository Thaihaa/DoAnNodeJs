import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useTheme,
  Avatar,
  alpha,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/NotificationBell';

const drawerWidth = 260;

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItemType {
  text: string;
  path: string;
  icon: React.ReactElement;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItemType[] = [
    { text: 'Tổng quan', path: '/admin', icon: <DashboardIcon /> },
    { text: 'Quản lý người dùng', path: '/admin/users', icon: <PeopleIcon /> },
    { text: 'Quản lý nhà hàng', path: '/admin/restaurants', icon: <RestaurantIcon /> },
    { text: 'Quản lý thực đơn', path: '/admin/menu', icon: <RestaurantMenuIcon /> },
    { text: 'Quản lý đơn hàng', path: '/admin/orders', icon: <ShoppingCartIcon /> },
    { text: 'Quản lý đặt bàn', path: '/admin/dat-ban', icon: <TableRestaurantIcon /> },
    { text: 'Cài đặt hệ thống', path: '/admin/settings', icon: <SettingsIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/dang-nhap');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: [3],
          py: 2,
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <RestaurantIcon sx={{ mr: 1 }} /> 
          Trang quản lý
        </Typography>
      </Toolbar>
      <Box sx={{ 
        py: 2, 
        px: 3, 
        display: 'flex', 
        alignItems: 'center', 
        backgroundColor: alpha(theme.palette.primary.main, 0.04)
      }}>
        <Avatar 
          alt={user?.fullName || 'Admin'} 
          src={user?.avatar ? `/avatars/${user.avatar}` : "/avatars/default-avatar.svg"} 
          sx={{ 
            width: 42, 
            height: 42, 
            mr: 2,
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: theme.palette.background.paper
          }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {user?.fullName || 'Admin'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email || 'admin@nhahang.com'}
          </Typography>
        </Box>
      </Box>
      <Divider />
      
      <Box sx={{ flexGrow: 1, px: 2, py: 3, overflowY: 'auto' }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: '60%',
                        width: 4,
                        borderRadius: 4,
                        backgroundColor: theme.palette.primary.main,
                        transition: theme.transitions.create(['height']),
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      }
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    minWidth: 42
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                      fontSize: '0.95rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      <Divider sx={{ mt: 'auto' }} />
      <List sx={{ px: 2, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              }
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: 42 }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Đăng xuất" 
              primaryTypographyProps={{
                color: theme.palette.error.main
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 1,
          backgroundColor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Quản lý Nhà hàng
          </Typography>
          
          <NotificationBell />
          
          <Tooltip title="Đăng xuất">
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                ml: 1,
                '&:hover': { color: theme.palette.error.main } 
              }}
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Về trang chủ">
            <IconButton
              color="primary"
              component={Link}
              to="/"
              sx={{ ml: 1 }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.05)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Toolbar />
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default AdminLayout; 