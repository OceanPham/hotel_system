import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Bed,
  Eye,
  Maximize2,
  Wifi,
  Coffee,
  Tv,
  Wine,
  Wind,
  ShieldCheck,
  Calendar,
  Star,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Spin, Breadcrumb, message, Rate } from 'antd';
import BookingModal from '../components/BookingModal';
import { roomApi, feedbackApi } from '../api';
import { APP_SETTINGS } from '../constants/settings';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        setLoading(true);
        // Fallback: fetch all and find if direct id endpoint has schema variation
        const res = await roomApi.getAllRooms();
        if (res && res.data) {
          const target = res.data.find((r) => String(r.id) === String(id));
          if (target) {
            setRoom(target);
            setSelectedImage(
              target.mainImage?.imageUrl ||
                target.images?.[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'
            );
          } else {
            message.error('Không tìm thấy thông tin phòng');
          }
        }

        // Fetch feedbacks
        try {
          const fbRes = await feedbackApi.getFeedbacksByRoom(id);
          if (fbRes && fbRes.data) {
            setFeedbacks(fbRes.data);
          }
        } catch (e) {
          console.warn('Chưa có feedback cho phòng này:', e);
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết phòng:', err);
        message.error('Không thể tải dữ liệu phòng');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoomDetail();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spin size="large" />
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">
            Đang chuẩn bị không gian phòng...
          </p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-24 text-center px-4">
        <h2 className="text-2xl font-serif font-bold text-slate-800">Không tìm thấy phòng này</h2>
        <Link to="/rooms" className="inline-block mt-4 text-xs font-bold text-amber-600 uppercase tracking-wider">
          ← Quay lại danh sách phòng
        </Link>
      </div>
    );
  }

  const galleryImages = [
    room.mainImage?.imageUrl,
    ...(room.images?.map((img) => img.imageUrl) || []),
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800&q=80',
  ].filter(Boolean);

  const uniqueGallery = Array.from(new Set(galleryImages));

  const amenities = [
    { icon: Wifi, title: 'Wi-Fi 6 Băng Thông Cao' },
    { icon: Wind, title: 'Điều Hòa Không Khí 2 Chiều' },
    { icon: Tv, title: 'Smart TV 65 inch OLED 4K' },
    { icon: Coffee, title: 'Máy Pha Cà Phê Nespresso' },
    { icon: Wine, title: 'Minibar Đồ Uống Thượng Hạng' },
    { icon: ShieldCheck, title: 'Két Sắt Điện Tử Bảo Mật' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="py-4">
          <Breadcrumb
            items={[
              { title: <Link to="/">Trang Chủ</Link> },
              { title: <Link to="/rooms">Phòng & Suite</Link> },
              { title: <span className="font-semibold text-amber-800">{room.roomName}</span> },
            ]}
          />
        </div>

        {/* Room Header Info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                Hạng: {room.roomType}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 text-xs font-mono">
                Số Phòng: #{room.roomNumber}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-5xl font-serif font-bold text-slate-900"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {room.roomName}
            </h1>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Giá niêm yết</span>
            <div className="flex items-baseline gap-1 md:justify-end">
              <span className="text-3xl font-serif font-bold text-amber-800">
                {formatPrice(room.basePrice)}
              </span>
              <span className="text-xs text-slate-500">/ đêm</span>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Large Image */}
          <div className="lg:col-span-9 h-[420px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 relative bg-slate-900">
            <img
              src={selectedImage || uniqueGallery[0]}
              alt={room.roomName}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-amber-300 flex items-center gap-1.5 border border-amber-400/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Chế độ xem không gian thực tế 5 sao</span>
            </div>
          </div>

          {/* Thumbnails Sidebar */}
          <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[500px] pb-2 lg:pb-0">
            {uniqueGallery.slice(0, 4).map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`flex-shrink-0 w-28 lg:w-full h-24 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all ${
                  selectedImage === imgUrl
                    ? 'border-amber-500 scale-[1.02] shadow-lg'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Two Columns Layout: Content & Sticky Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6">
          {/* Left Column: Details, Amenities, Policies */}
          <div className="lg:col-span-8 space-y-10">
            {/* Key Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-amber-500/20 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Diện tích</span>
                  <span className="text-sm font-bold text-slate-800">45 - 65 m²</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Sức chứa</span>
                  <span className="text-sm font-bold text-slate-800">2 Người lớn</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Loại giường</span>
                  <span className="text-sm font-bold text-slate-800">1 King Size</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Tầm nhìn</span>
                  <span className="text-sm font-bold text-slate-800">Biển / Vườn</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2
                className="text-2xl font-serif font-bold text-slate-900 border-l-4 border-amber-500 pl-4"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Giới Thiệu Không Gian
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {room.description ||
                  'Phòng được thiết kế theo phong cách tân cổ điển thanh lịch, ngập tràn ánh sáng tự nhiên với ban công rộng mở ngắm toàn cảnh đại dương. Nội thất sử dụng gỗ sồi tự nhiên, đá cẩm thạch Ý cao cấp cùng các chi tiết mạ vàng tinh tế, mang lại trải nghiệm xa hoa và thư thái bậc nhất.'}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mỗi chi tiết đều được tuyển chọn kỹ lưỡng, từ bộ drap giường lụa Ai Cập 800 sợi đến hương thơm tinh dầu cam bergamot độc quyền của thương hiệu LUMIÈRE.
              </p>
            </div>

            {/* Luxury Amenities Grid */}
            <div className="space-y-4">
              <h2
                className="text-2xl font-serif font-bold text-slate-900 border-l-4 border-amber-500 pl-4"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Tiện Nghi Cao Cấp Đi Kèm
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities.map((item, i) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <h3 className="text-base font-bold text-amber-900 uppercase tracking-wider text-xs">
                Chính Sách Khách Sạn
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thời gian nhận phòng: Từ 14:00 - Trả phòng: Trước 12:00</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Miễn phí hủy phòng trước 24 giờ kể từ thời điểm nhận phòng</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Miễn phí bữa sáng buffet quốc tế tại nhà hàng chính</span>
                </li>
              </ul>
            </div>

            {/* Feedbacks Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-serif font-bold text-slate-900"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Đánh Giá Từ Khách Đã Ở
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>5.0 / 5.0 (Tuyệt Hảo)</span>
                </div>
              </div>

              {feedbacks.length > 0 ? (
                <div className="space-y-3">
                  {feedbacks.map((fb, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{fb.userName || 'Khách hàng ẩn danh'}</span>
                        <Rate disabled defaultValue={fb.rating || 5} className="text-xs" />
                      </div>
                      <p className="text-xs text-slate-600 italic">"{fb.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 text-center">
                  "Không gian nghỉ dưỡng tuyệt vời, dịch vụ vượt ngoài mong đợi của gia đình tôi!" — Đánh giá từ khách lưu trú gần nhất.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 shadow-2xl border border-amber-500/30 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 block">
                  Giá Ưu Đãi Trực Tiếp
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-serif font-bold text-slate-900">
                    {formatPrice(room.basePrice)}
                  </span>
                  <span className="text-xs text-slate-500">/ đêm</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-800 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Đặc quyền đặt trực tuyến:
                </div>
                <p className="text-[11px] leading-relaxed">
                  ✓ Miễn phí nâng hạng phòng khi còn phòng trống <br />
                  ✓ Tặng coupon Spa trị giá 300.000 ₫ <br />
                  ✓ Nhận phòng sớm & trả phòng muộn linh hoạt
                </p>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Đặt Phòng Này Ngay
              </button>

              <div className="text-center">
                <a
                  href={APP_SETTINGS.contact.phoneTel}
                  className="text-xs text-slate-500 hover:text-amber-700 font-medium transition-colors"
                >
                  Cần hỗ trợ? Gọi hotline: <strong>{APP_SETTINGS.contact.phoneDisplay}</strong>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={bookingModalOpen}
        onCancel={() => setBookingModalOpen(false)}
        room={room}
      />
    </div>
  );
};

export default RoomDetailPage;
