import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Empty, Tag } from 'antd';
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowLeft, BedDouble, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../api';

const BookingHistoryPage = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await bookingApi.getMyBookings();
        if (res && res.data) {
          setBookings(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đặt phòng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated]);

  const getStatusTag = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Tag color="gold">Đã Xác Nhận</Tag>;
      case 'completed':
        return <Tag color="green">Đã Hoàn Tất</Tag>;
      case 'cancelled':
        return <Tag color="red">Đã Hủy</Tag>;
      default:
        return <Tag color="blue">{status || 'Chờ xử lý'}</Tag>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-24">
      {/* Header Banner */}
      <div className="bg-[#062C24] text-white py-14 px-4 mb-10 border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Quản Lý Lịch Trình Cá Nhân
          </span>
          <h1
            className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Lịch Sử Đặt Phòng Của Quý Khách
          </h1>
          <p className="text-xs text-slate-300">
            Theo dõi chi tiết các chuyến lưu trú, trạng thái phòng và thanh toán hóa đơn.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {!isAuthenticated ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-amber-500/20 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Vui lòng đăng nhập để xem lịch sử đặt phòng
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Đăng nhập bằng tài khoản của quý khách để tra cứu danh sách các kỳ nghỉ đã và đang diễn ra.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold uppercase text-xs tracking-wider shadow-lg shadow-amber-500/20"
            >
              Đăng Nhập Ngay
            </button>
          </div>
        ) : loading ? (
          <div className="py-24 text-center">
            <Spin size="large" />
            <p className="text-xs text-amber-800 uppercase tracking-widest font-semibold mt-4">
              Đang tải danh sách đặt phòng...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-200 space-y-4">
            <Empty description="Quý khách chưa có đơn đặt phòng nào" />
            <Link
              to="/rooms"
              className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold uppercase text-xs tracking-wider"
            >
              Khám Phá Phòng & Đặt Ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border border-amber-500/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono text-amber-800">
                      Mã đơn #{b.id}
                    </span>
                    {getStatusTag(b.status)}
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      Loại: {b.bookingType === 'Day' ? 'Theo ngày' : 'Qua đêm'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-base font-serif font-bold text-slate-900">
                    <BedDouble className="w-4 h-4 text-amber-600" />
                    <span>Phòng #{b.roomNumber || b.roomId}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nhận phòng: <strong>{b.checkInDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Trả phòng: <strong>{b.checkOutDate}</strong></span>
                    </div>
                  </div>

                  {b.note && (
                    <p className="text-xs text-slate-500 italic">
                      Ghi chú: {b.note}
                    </p>
                  )}
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase">Thời gian tạo</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {b.createdAt || 'Gần đây'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
