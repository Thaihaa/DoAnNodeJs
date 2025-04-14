import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Link,
  Badge,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const pages = [
  { title: 'Ưu Đãi', path: '/uu-dai' },
  { title: 'Thực Đơn', path: '/thuc-don' },
  { title: 'Đặt Bàn', path: '/dat-ban' }
];

const Header: React.FC = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleCloseUserMenu();
  };

  return (
    <>
      {/* Top Bar */}
      <Box 
        sx={{ 
          bgcolor: '#f5f5f5', 
          py: 0.5, 
          borderBottom: '1px solid #e0e0e0',
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <img src="/vn-flag.png" alt="Việt Nam" style={{ width: 16, height: 16, marginRight: 4 }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Tiếng Việt
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 16 }} />
            
            {isAuthenticated ? (
              <>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', mx: 1 }}>
                  Xin chào, {user?.fullName || user?.username}
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 16 }} />
                <Link 
                  component="button"
                  onClick={handleLogout}
                  sx={{ color: 'text.secondary', fontSize: '0.75rem', textDecoration: 'none', mx: 1 }}
                >
                  Đăng xuất
                </Link>
              </>
            ) : (
              <>
                <Link 
                  component={RouterLink} 
                  to="/dang-nhap" 
                  sx={{ color: 'text.secondary', fontSize: '0.75rem', textDecoration: 'none', mx: 1 }}
                >
                  Đăng nhập
                </Link>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 16 }} />
                <Link 
                  component={RouterLink} 
                  to="/dang-ky" 
                  sx={{ color: 'text.secondary', fontSize: '0.75rem', textDecoration: 'none', mx: 1 }}
                >
                  Đăng ký
                </Link>
              </>
            )}
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 16 }} />
            <Link 
              component={RouterLink} 
              to="/vi-tri-cua-hang" 
              sx={{ 
                color: 'text.secondary', 
                fontSize: '0.75rem', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center',
                mx: 1 
              }}
            >
              <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
              Vị trí cửa hàng
            </Link>
          </Box>
        </Container>
      </Box>

      <AppBar position="static" color="default" elevation={0} sx={{ backgroundColor: 'white' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo Desktop */}
            <Box 
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                textDecoration: 'none',
              }}
            >
              <img src="/manwah-logo.svg" alt="Manwah" style={{ height: 50 }} />
            </Box>

            {/* Mobile Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                    <Typography 
                      textAlign="center"
                      component={RouterLink}
                      to={page.path}
                      sx={{
                        color: 'inherit',
                        textDecoration: 'none'
                      }}
                    >
                      {page.title}
                    </Typography>
                  </MenuItem>
                ))}
                
                {!isAuthenticated && (
                  [
                    <MenuItem key="login" onClick={handleCloseNavMenu}>
                      <Typography 
                        textAlign="center"
                        component={RouterLink}
                        to="/dang-nhap"
                        sx={{
                          color: 'inherit',
                          textDecoration: 'none'
                        }}
                      >
                        Đăng nhập
                      </Typography>
                    </MenuItem>,
                    <MenuItem key="register" onClick={handleCloseNavMenu}>
                      <Typography 
                        textAlign="center"
                        component={RouterLink}
                        to="/dang-ky"
                        sx={{
                          color: 'inherit',
                          textDecoration: 'none'
                        }}
                      >
                        Đăng ký
                      </Typography>
                    </MenuItem>
                  ]
                )}
              </Menu>
            </Box>

            {/* Logo Mobile */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                textDecoration: 'none',
              }}
            >
              <img src="/manwah-logo.svg" alt="Manwah" style={{ height: 40 }} />
            </Box>

            {/* Desktop Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {pages.map((page) => (
                <Button
                  key={page.title}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, mx: 3, color: '#333', display: 'block', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>

            {/* Right Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <Tooltip title="Cài đặt tài khoản">
                    <IconButton onClick={handleOpenUserMenu} sx={{ ml: 1 }}>
                      <Avatar 
                        alt={user?.fullName || user?.username} 
                        src={user?.avatar ? `/avatars/${user.avatar}` : "/avatars/default-avatar.svg"}
                        sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
                      >
                        {user?.fullName?.[0] || user?.username?.[0] || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    id="user-menu"
                    anchorEl={userMenuAnchor}
                    keepMounted
                    open={Boolean(userMenuAnchor)}
                    onClose={handleCloseUserMenu}
                    PaperProps={{
                      elevation: 2,
                      sx: { minWidth: 180 }
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem component={RouterLink} to="/tai-khoan" onClick={handleCloseUserMenu}>
                      <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">Tài khoản của tôi</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">Đăng xuất</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <Button 
                    component={RouterLink} 
                    to="/dang-nhap" 
                    variant="outlined" 
                    color="primary"
                    size="small"
                    sx={{ mr: 1, borderRadius: 2 }}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/dang-ky" 
                    variant="contained" 
                    color="primary"
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Đăng ký
                  </Button>
                </Box>
              )}
              
              <IconButton
                component={RouterLink}
                to="/cart"
                color="inherit"
                sx={{ ml: 2 }}
                aria-label="Giỏ hàng"
              >
                <Badge badgeContent={totalItems} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Header; 