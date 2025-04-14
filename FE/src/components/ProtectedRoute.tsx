import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectPath = '/dang-nhap'
}) => {
  const { isAuthenticated, user, token, checkAdmin, isAdmin } = useAuth();
  const [checking, setChecking] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const checkPermission = async () => {
      if (!isAuthenticated || !token) {
        setChecking(false);
        return;
      }

      if (requiredRole === 'admin') {
        // Kiểm tra quyền admin
        if (user?.role === 'admin') {
          setHasPermission(true);
        } else {
          // Gọi API kiểm tra
          const isAdminUser = await checkAdmin();
          setHasPermission(isAdminUser);
        }
      } else if (requiredRole === 'staff') {
        // Kiểm tra quyền staff hoặc admin
        setHasPermission(user?.role === 'staff' || user?.role === 'admin' || isAdmin);
      } else {
        // Chỉ cần đăng nhập
        setHasPermission(true);
      }

      setChecking(false);
    };

    checkPermission();
  }, [isAuthenticated, token, user, requiredRole, checkAdmin, isAdmin]);

  if (checking) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 3
        }}
      >
        <CircularProgress size={50} color="primary" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại đường dẫn hiện tại để redirect sau khi đăng nhập
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (!hasPermission) {
    return <Navigate to="/khong-co-quyen-truy-cap" replace />;
  }

  return <>{children}</>;
};

// Shorthand for admin routes
export const AdminRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRole'>> = ({
  children,
  ...props
}) => (
  <ProtectedRoute {...props} requiredRole="admin">
    {children}
  </ProtectedRoute>
);

// Shorthand for staff routes
export const StaffRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRole'>> = ({
  children,
  ...props
}) => (
  <ProtectedRoute {...props} requiredRole="staff">
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute; 