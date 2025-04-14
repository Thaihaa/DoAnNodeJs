import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  checkAdmin: () => Promise<boolean>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: authService.getUser(),
    token: localStorage.getItem('token'),
    isAuthenticated: authService.isAuthenticated(),
    loading: false,
    error: null
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(
    state.user?.role === 'admin' || false
  );

  // Kiểm tra trạng thái xác thực khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          setState(prev => ({ ...prev, loading: true }));
          const response = await authService.getCurrentUser();
          if (response.success && response.user) {
            setState({
              user: response.user,
              token: state.token,
              isAuthenticated: true,
              loading: false,
              error: null
            });
            // Cập nhật trạng thái admin
            setIsAdmin(response.user.role === 'admin');
          } else {
            // Token không hợp lệ
            await logout();
          }
        } catch (error) {
          // Lỗi xác thực, đăng xuất
          await logout();
        }
      }
    };

    checkAuth();
  }, [state.token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setErrorMessage(null);
    
    try {
      // Chỉ dùng một cách đăng nhập đơn giản nhất
      console.log('Đăng nhập qua API');
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
      
      // Đăng nhập thành công
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      
      return true;
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error.message);
      setErrorMessage('Đăng nhập thất bại: ' + (error.message || 'Lỗi kết nối server'));
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setErrorMessage(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }
      
      // Đăng ký thành công, lưu token và thông tin người dùng
      localStorage.setItem('token', data.token);
      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      return true;
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error.message);
      setErrorMessage('Đăng ký thất bại: ' + (error.message || 'Lỗi kết nối server'));
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
  };

  const checkAdmin = async (): Promise<boolean> => {
    if (!state.token || !state.isAuthenticated) {
      setIsAdmin(false);
      return false;
    }
    
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/api/check-admin`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.isAdmin) {
        setIsAdmin(true);
        return true;
      } else {
        setIsAdmin(false);
        return false;
      }
    } catch (error) {
      console.error('Lỗi kiểm tra quyền admin:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));
    await authService.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
    setIsAdmin(false);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    errorMessage,
    setErrorMessage,
    checkAdmin,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 