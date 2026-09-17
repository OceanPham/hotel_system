import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Award,
  ShieldCheck,
  Star,
  ChevronRight,
  Coffee,
  Waves,
  Utensils,
  Car,
  Compass,
  ArrowUpRight,
  Quote,
} from 'lucide-react';
import { Spin } from 'antd';
import QuickBookingBar from '../components/QuickBookingBar';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import { roomApi, feedbackApi } from '../api';

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsRes, feedbackRes] = await Promise.allSettled([
          roomApi.getAllRooms(),
          feedbackApi.getAllFeedbacks(),
        ]);

        if (roomsRes.status === 'fulfilled' && roomsRes.value?.data) {
          setRooms(roomsRes.value.data);
        }

        if (feedbackRes.status === 'fulfilled' && feedbackRes.value?.data) {
          setFeedbacks(feedbackRes.value.data.slice(0, 4));
        }
      } catch (e) {
        console.error('Lỗi tải dữ liệu trang chủ:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRooms = rooms.filter((r) => {
    if (activeCategory === 'ALL') return true;
    return r.roomType?.toLowerCase() === activeCategory.toLowerCase();
  });

  const luxuryServices = [
    {
      id: 1,
      title: 'Ẩm Thực Thượng Hạng',
      subtitle: 'Michelin Star Dining',
      desc: 'Hương vị đỉnh cao được sáng tạo bởi các đầu bếp đẳng cấp thế giới cùng nguồn hải sản tươi ngon nhất vịnh biển.',
      icon: Utensils,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    },
    {
      id: 2,
      title: 'Lumière Spa Trị Liệu',
      subtitle: 'Holistic Body Wellness',
      desc: 'Liệu trình thư giãn chuyên sâu kết hợp thảo mộc thiên nhiên phương Đông và tinh hoa trị liệu Thụy Sĩ.',
      icon: Waves,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    },
    {
      id: 3,
      title: 'Hồ Bơi Vô Cực Chân Mây',
      subtitle: 'Panoramic Infinity Pool',
      desc: 'Thả mình giữa làn nước trong xanh hướng thẳng ra biển khơi bao la và hoàng hôn lãng mạn tuyệt mỹ.',
      icon: Compass,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    },
    {
      id: 4,
      title: 'Đưa Đón VIP Limousine',
      subtitle: 'Chauffeur Service',
      desc: 'Hành trình di chuyển đẳng cấp với dòng xe siêu sang Rolls-Royce & Maybach cùng tài xế riêng tận tụy.',
      icon: Car,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-36 px-4 overflow-hidden">
        {/* Background Image with Ambient Zoom */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=85"
            alt="Lumière Palace Resort"
            className="w-full h-full object-cover scale-105 animate-pulse duration-[10000ms]"
          />
          {/* Multi-layered Vignette & Emerald Tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#051C17]/90 via-[#062C24]/75 to-[#FAF8F5]" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 pt-10">
          {/* 5-Star Tag */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-widest uppercase shadow-lg shadow-amber-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Khu Nghỉ Dưỡng & Khách Sạn 5 Sao Quốc Tế</span>
          </motion.div>

          {/* Main Title with Gold Shimmer Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.1]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Nơi Đẳng Cấp Thăng Hoa <br />
            <span className="text-gold-bright italic font-normal">
              Đỉnh Cao Nghỉ Dưỡng Hoàng Gia
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base text-slate-200/90 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Trải nghiệm không gian xa hoa biệt lập giữa thiên nhiên ngoạn mục,
            nơi mọi giác quan được đánh thức bởi dịch vụ cá nhân hóa chuẩn mực toàn cầu.
          </motion.p>
        </div>

        {/* Floating Quick Booking Bar */}
        <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <QuickBookingBar />
          </motion.div>
        </div>
      </section>

      {/* 2. BRAND STORY & STATS SECTION */}
      <section id="story" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Images Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 h-72"
              >
                <img
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80"
                  alt="Luxury Suite"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 h-52 bg-emerald-950 p-6 flex flex-col justify-between text-white"
              >
                <Quote className="w-8 h-8 text-amber-400 opacity-60" />
                <p className="text-xs font-serif italic leading-relaxed">
                  "Sự hoàn mỹ không nằm ở những chi tiết lớn, mà nằm trong từng trải nghiệm nhỏ được chăm sóc tận tâm."
                </p>
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                  — Tổng Quản Lý LUMIÈRE
                </span>
              </motion.div>
            </div>

            <div className="space-y-4 pt-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 h-52"
              >
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80"
                  alt="Spa Lounge"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 h-72"
              >
                <img
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80"
                  alt="Poolside View"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Central Floating Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-amber-400/40 shadow-2xl text-center">
              <span className="text-2xl font-serif font-bold text-amber-700 block">2026</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold">Khách Sạn Sang Trọng Bậc Nhất</span>
            </div>
          </div>

          {/* Text Editorial */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700">
              <span className="w-8 h-[2px] bg-amber-500" />
              Câu Chuyện Thương Hiệu
            </div>

            <h2
              className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 leading-[1.15]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Kiến Trúc Hoàng Gia <br />
              <span className="italic text-emerald-900 font-normal">Hòa Cùng Vị Mặn Biển Khơi</span>
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Tọa lạc tại vị trí đắc địa nhất của bán đảo Sơn Trà, <strong>LUMIÈRE PALACE</strong> là
              biểu tượng của sự tinh tế và xa hoa. Mỗi đường nét kiến trúc đều được chế tác tinh xảo,
              kết hợp hài hòa giữa nét cổ điển Pháp và vẻ đẹp tráng lệ của bờ biển miền nhiệt đới.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              Tại đây, sự riêng tư tuyệt đối của quý khách là ưu tiên hàng đầu. Với dịch vụ quản gia 24/7,
              ẩm thực tinh hoa và hệ thống phòng ốc đẳng cấp, chúng tôi biến mỗi kỳ nghỉ thành một hành trình
              kỷ niệm vô giá.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-amber-500/20">
              <div>
                <span className="text-3xl font-serif font-bold text-emerald-950 block">99.8%</span>
                <span className="text-xs text-slate-500 font-medium">Hài lòng tuyệt đối</span>
              </div>
              <div>
                <span className="text-3xl font-serif font-bold text-emerald-950 block">50+</span>
                <span className="text-xs text-slate-500 font-medium">Tiện nghi độc quyền</span>
              </div>
              <div>
                <span className="text-3xl font-serif font-bold text-emerald-950 block">5 Sao</span>
                <span className="text-xs text-slate-500 font-medium">Tiêu chuẩn Forbes</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/rooms"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#062C24] hover:bg-[#0B4236] text-amber-300 font-semibold text-xs tracking-wider uppercase transition-all duration-300 shadow-xl shadow-emerald-950/20"
              >
                <span>Khám Phá Các Hạng Phòng</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ROOMS & SUITES */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Không Gian Nghỉ Dưỡng Thượng Lưu
          </span>
          <h2
            className="text-3xl sm:text-5xl font-serif font-bold text-slate-900"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Bộ Sưu Tập Phòng & Suite
          </h2>
          <p className="text-sm text-slate-600 font-light leading-relaxed">
            Mỗi căn phòng là một kiệt tác nghệ thuật với tầm nhìn ngoạn mục hướng biển hoặc khu vườn nhiệt đới,
            được trang bị nội thất xa xỉ và tiện nghi tân tiến nhất.
          </p>

          {/* Category Filter Tabs */}
          <div className="inline-flex p-1.5 rounded-full bg-white border border-amber-500/20 shadow-md">
            {[
              { key: 'ALL', label: 'Tất Cả' },
              { key: 'Standard', label: 'Standard Collection' },
              { key: 'Deluxe', label: 'Deluxe Suite' },
              { key: 'Suite', label: 'Royal Suite' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  activeCategory === cat.key
                    ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 shadow-md font-bold'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <Spin size="large" />
            <p className="text-xs text-amber-800 uppercase tracking-widest font-semibold mt-4">
              Đang tải danh sách phòng...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBookNow={(r) => setSelectedRoomForBooking(r)}
              />
            ))}
          </div>
        )}

        <div className="text-center pt-12">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-amber-600/40 text-amber-800 hover:bg-amber-500/10 font-bold text-xs uppercase tracking-widest transition-all"
          >
            <span>Xem Toàn Bộ 10 Phòng & Bảng Giá Chi Tiết</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. CURATED 5-STAR SERVICES */}
      <section className="py-24 bg-[#062C24] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Trải Nghiệm Hoàn Mỹ
            </span>
            <h2
              className="text-3xl sm:text-5xl font-serif font-bold text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Dịch Vụ & Tiện Ích Chuẩn 5 Sao
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              Mỗi dịch vụ tại LUMIÈRE PALACE được thiết kế công phu để mang lại cảm giác thỏa mãn
              tuyệt đối cho những kỳ nghỉ riêng tư đáng nhớ nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {luxuryServices.map((svc) => {
              const IconComp = svc.icon;
              return (
                <motion.div
                  key={svc.id}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-3xl overflow-hidden bg-white/5 border border-amber-400/20 backdrop-blur-md flex flex-col h-[400px] transition-all duration-500 hover:border-amber-400/60"
                >
                  <div className="h-48 w-full overflow-hidden relative">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#062C24] via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                        {svc.subtitle}
                      </span>
                      <h3
                        className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {svc.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-light">
                        {svc.desc}
                      </p>
                    </div>

                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white transition-colors pt-2"
                    >
                      <span>Tìm hiểu thêm</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. GUEST FEEDBACKS (From Backend Database) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Cảm Nhận Từ Trái Tim
          </span>
          <h2
            className="text-3xl sm:text-5xl font-serif font-bold text-slate-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Đánh Giá Từ Khách Hàng
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-light">
            Những chia sẻ chân thực từ các vị khách quý sau những ngày lưu trú đáng nhớ tại khách sạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: 1,
              name: 'Trần Thị Bình',
              room: 'Garden Deluxe (101)',
              rating: 5,
              comment: 'Rất hài lòng với dịch vụ. Phòng ốc cực kỳ sạch sẽ, nhân viên chu đáo từng chi tiết nhỏ nhất. Nhất định sẽ quay lại cùng gia đình vào mùa hè tới!',
              date: '04/06/2025',
            },
            {
              id: 2,
              name: 'Lê Hoàng Dũng',
              room: 'City View Deluxe (103)',
              rating: 5,
              comment: 'Trải nghiệm tuyệt vời. Tầm nhìn từ phòng ngủ nhìn ra thành phố lúc lên đèn đẹp mê hoặc. Bữa sáng buffet hải sản rất phong phú và chất lượng cao.',
              date: '12/06/2025',
            },
            {
              id: 3,
              name: 'Đinh Thị Hồng',
              room: 'Ocean Suite (105)',
              rating: 5,
              comment: 'Phòng suite view biển đẹp vượt mong đợi. Bể bơi vô cực và spa là điểm nhấn hoàn hảo cho chuyến nghỉ dưỡng trăng mật của chúng tôi!',
              date: '07/06/2025',
            },
          ].map((fb) => (
            <motion.div
              key={fb.id}
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-white border border-amber-500/20 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(fb.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{fb.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{fb.name}</h4>
                  <span className="text-[11px] text-amber-700 font-medium">{fb.room}</span>
                </div>
                <span className="text-[10px] text-slate-400">{fb.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION LUXURY BANNER */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-r from-[#073B30] via-[#0B4236] to-[#051F1A] text-white p-8 sm:p-14 relative shadow-2xl border border-amber-400/30">
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-400/30">
              Đặc Quyền Mùa Nghỉ Dưỡng 2026
            </span>
            <h2
              className="text-3xl sm:text-5xl font-serif font-bold leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Kỳ Nghỉ Trong Mơ <br />
              <span className="text-gold-bright">Đang Chờ Đón Quý Khách</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              Đặt phòng trực tiếp trên website ngay hôm nay để nhận ưu đãi giảm 15% tổng hóa đơn
              kèm miễn phí bữa sáng buffet và dịch vụ đưa đón sân bay cao cấp.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/rooms"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform"
              >
                Đặt Phòng Ngay
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-full border border-amber-400/40 text-amber-200 hover:bg-white/5 font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Liên Hệ Concierge
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden lg:block">
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-400 fill-current">
              <path d="M45,-75C58,-69,68,-58,74,-45C80,-32,82,-16,81,-1C80,14,76,28,69,40C62,52,52,62,40,69C28,76,14,80,-1,82C-16,83,-32,82,-45,75C-58,68,-69,56,-75,42C-81,28,-82,12,-80,-4C-78,-20,-73,-36,-63,-48C-53,-60,-38,-68,-23,-73C-8,-78,8,-80,24,-79C40,-78,50,-74,45,-75Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          open={!!selectedRoomForBooking}
          onCancel={() => setSelectedRoomForBooking(null)}
          room={selectedRoomForBooking}
        />
      )}
    </div>
  );
};

export default HomePage;
