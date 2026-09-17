import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  User,
  LogOut,
  Calendar,
  Menu,
  X,
  Compass,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Dropdown } from 'antd';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { APP_SETTINGS } from '../constants/settings';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Phòng & Suite', path: '/rooms' },
    { name: 'Dịch Vụ 5 Sao', path: '/services' },
    { name: 'Về Chúng Tôi', path: '/#story' },
    { name: 'Liên Hệ & Hỗ Trợ', path: '/contact' },
  ];

  const userMenuItems = [
    {
      key: 'user-header',
      label: (
        <div className="px-2 py-1.5 border-b border-amber-500/20">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Tài khoản</p>
          <p className="text-sm font-medium text-slate-800">{user?.fullName || user?.username}</p>
          <p className="text-xs text-slate-500">{user?.role || 'Khách hàng'}</p>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'history',
      icon: <Calendar className="w-4 h-4 text-amber-600" />,
      label: <span className="font-medium">Lịch sử đặt phòng</span>,
      onClick: () => navigate('/bookinghistory'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      label: <span className="text-red-600 font-medium">Đăng xuất</span>,
      onClick: logout,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3.5 bg-[#062C24]/90 backdrop-blur-md shadow-2xl border-b border-amber-400/20'
            : 'py-5 bg-gradient-to-b from-[#062C24]/95 via-[#062C24]/75 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo variant="light" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative text-[14px] font-medium tracking-wide transition-colors duration-300 py-1 ${
                      isActive
                        ? 'text-[#F5DF9E]'
                        : 'text-slate-200 hover:text-[#D4AF37]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F5DF9E] via-[#D4AF37] to-[#99751A] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-5">
              {/* Hotline concierge */}
              <a
                href={APP_SETTINGS.contact.phoneTel}
                className="flex items-center gap-2 text-xs font-semibold text-amber-200/90 hover:text-amber-300 transition-colors border-r border-amber-500/20 pr-4"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-300 uppercase tracking-wider font-light">Concierge 24/7</p>
                  <p className="tracking-wide">{APP_SETTINGS.contact.phoneDisplay}</p>
                </div>
              </a>

              {/* User Account / Login Button */}
              {isAuthenticated ? (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-amber-400/30 text-white transition-all">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-slate-900 font-bold text-xs shadow-inner">
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-medium max-w-[100px] truncate">
                      {user?.fullName || user?.username}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </Dropdown>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-amber-400/20"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đăng nhập</span>
                </button>
              )}

              {/* Book Now Button with Gold Pulse */}
              <Link
                to="/rooms"
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full overflow-hidden text-xs font-semibold tracking-wider uppercase text-slate-950 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-amber-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5DF9E] via-[#D4AF37] to-[#E5C158] transition-transform duration-500 group-hover:scale-105" />
                <span className="relative flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  Đặt Phòng Ngay
                </span>
              </Link>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex items-center gap-3 lg:hidden">
              <Link
                to="/rooms"
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-bold text-[11px] uppercase tracking-wider"
              >
                Đặt Phòng
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-amber-400/20"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-amber-300" /> : <Menu className="w-6 h-6 text-amber-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-[#062C24]/98 backdrop-blur-xl border-b border-amber-500/20 px-4 pt-3 pb-6 space-y-3"
            >
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="pt-3 border-t border-amber-500/20 flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-1 text-xs text-amber-300 font-semibold">
                      Xin chào, {user?.fullName || user?.username}
                    </div>
                    <Link
                      to="/bookinghistory"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5"
                    >
                      <Calendar className="w-4 h-4 text-amber-400" />
                      Lịch sử đặt phòng
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      openAuthModal('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-400/40 text-amber-300 font-medium text-sm"
                  >
                    <User className="w-4 h-4" />
                    Đăng Nhập / Đăng Ký
                  </button>
                )}

                <a
                  href={APP_SETTINGS.contact.phoneTel}
                  className="flex items-center justify-center gap-2 py-2 text-xs text-slate-300"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  Hotline Concierge: {APP_SETTINGS.contact.phoneDisplay}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
