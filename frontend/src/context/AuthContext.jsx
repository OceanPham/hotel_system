import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Lỗi phân tích user từ storage:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (username, password) => {
    try {
      const res = await authApi.login({ username, password });
      if (res && res.data) {
        const { token: jwtToken, user: userData } = res.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        message.success(`Chào mừng trở lại, ${userData.fullName || userData.username}!`);
        setIsAuthModalOpen(false);
        return { success: true, user: userData };
      }
      throw new Error(res?.message || 'Đăng nhập không thành công');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Tài khoản hoặc mật khẩu không chính xác';
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        ...userData,
        role: 'USER',
        status: 'Active'
      };
      const res = await authApi.register(payload);
      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      setAuthModalTab('login');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    message.info('Đã đăng xuất tài khoản.');
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
