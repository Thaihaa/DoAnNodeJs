import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReservationPage from './pages/ReservationPage';
import CartPage from './pages/CartPage';
import MenuPage from './pages/MenuPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import { AdminRoute } from './components/ProtectedRoute';
import ReservationsPage from './pages/admin/ReservationsPage';
import AdminMenuPage from './pages/admin/MenuPage';
import ReservationDetailPage from './pages/ReservationDetailPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';


// Tạo theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#26a69a',
      light: '#4db6ac',
      dark: '#00796b',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef5350',
      light: '#e57373',
      dark: '#c62828',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#388e3c',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#546e7a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <DashboardPage />
                    </AdminLayout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <UsersPage />
                    </AdminLayout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/restaurants" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <div>Quản lý nhà hàng - Đang phát triển</div>
                    </AdminLayout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/menu" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminMenuPage />
                    </AdminLayout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <div>Quản lý đơn hàng - Đang phát triển</div>
                    </AdminLayout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/reservations" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <div>Quản lý đặt bàn - Đang phát triển</div>
                    </AdminLayout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <div>Cài đặt hệ thống - Đang phát triển</div>
                    </AdminLayout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/dat-ban"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <ReservationsPage />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              
              {/* Client Routes */}
              <Route path="/" element={
                <>
                  <Header />
                  <HomePage />
                  <Footer />
                </>
              } />
              <Route path="/dat-ban" element={
                <>
                  <Header />
                  <ReservationPage />
                  <Footer />
                </>
              } />
              <Route path="/cart" element={
                <>
                  <Header />
                  <CartPage />
                  <Footer />
                </>
              } />
              <Route path="/thuc-don" element={
                <>
                  <Header />
                  <MenuPage />
                  <Footer />
                </>
              } />
              <Route path="/dang-nhap" element={
                <>
                  <Header />
                  <LoginPage />
                  <Footer />
                </>
              } />
              <Route path="/dang-ky" element={
                <>
                  <Header />
                  <RegisterPage />
                  <Footer />
                </>
              } />
              <Route path="/uu-dai" element={
                <>
                  <Header />
                  <div>Ưu Đãi</div>
                  <Footer />
                </>
              } />
              <Route path="/unauthorized" element={
                <>
                  <Header />
                  <UnauthorizedPage />
                  <Footer />
                </>
              } />
               <Route path="/reservation-detail" element={
                <>
                  <Header />
                  <ReservationDetailPage />
                  <Footer />
                </>
              } />
              <Route path="/payment/callback" element={
                <>
                  <Header />
                  <PaymentCallbackPage />
                  <Footer />
                </>
              } />
              <Route path="/payment/success" element={
                <>
                  <Header />
                  <PaymentCallbackPage />
                  <Footer />
                </>
              } />
              <Route path="/payment/error" element={
                <>
                  <Header />
                  <PaymentCallbackPage />
                  <Footer />
                </>
              } />
            </Routes>
          </Router>
        </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
