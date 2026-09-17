import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import FloatingContact from './components/FloatingContact';

import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import BookingHistoryPage from './pages/BookingHistoryPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#0B4236',
          colorSuccess: '#10B981',
          colorWarning: '#D4AF37',
          colorInfo: '#D4AF37',
          borderRadius: 14,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          colorLink: '#0B4236',
          colorLinkHover: '#D4AF37',
        },
        components: {
          Button: {
            borderRadius: 14,
            fontWeight: 600,
          },
          Input: {
            borderRadius: 14,
          },
          Select: {
            borderRadius: 14,
          },
          Modal: {
            borderRadiusLG: 24,
          },
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/listroom" element={<RoomsPage />} />
                <Route path="/rooms/:id" element={<RoomDetailPage />} />
                <Route path="/detailroom/:id" element={<RoomDetailPage />} />
                <Route path="/detailroom" element={<RoomsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/listservice" element={<ServicesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/helps" element={<ContactPage />} />
                <Route path="/bookinghistory" element={<BookingHistoryPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Footer />
            <AuthModal />
            <FloatingContact />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
