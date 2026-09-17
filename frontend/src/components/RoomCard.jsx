import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Bed, Eye, Star, Sparkles, Check, ArrowRight } from 'lucide-react';

const RoomCard = ({ room, onBookNow }) => {
  const imageUrl =
    room.mainImage?.imageUrl ||
    room.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  const getCategoryBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'suite':
        return 'bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-bold border-amber-300';
      case 'deluxe':
        return 'bg-gradient-to-r from-emerald-800 to-emerald-600 text-amber-200 border-emerald-500';
      default:
        return 'bg-slate-800/85 text-slate-200 border-slate-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-amber-500/20 hover:border-amber-400/50"
    >
      {/* Image Container */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
        <img
          src={imageUrl}
          alt={room.roomName}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span
            className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider border shadow-md ${getCategoryBadgeColor(
              room.roomType
            )}`}
          >
            {room.roomType || 'Standard'}
          </span>

          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-amber-300 border border-amber-400/30">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">5.0</span>
          </div>
        </div>

        {/* Floating Price Tag on Image Bottom */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="text-xs text-amber-200 font-light block tracking-wider uppercase">Giá phòng</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-serif text-white tracking-wide">
              {formatPrice(room.basePrice)}
            </span>
            <span className="text-xs text-slate-300 font-light">/ đêm</span>
          </div>
        </div>

        {/* Room Number Badge */}
        <div className="absolute bottom-4 right-4 z-10 text-[11px] font-mono text-amber-300/90 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-400/20">
          Phòng #{room.roomNumber}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            className="text-2xl font-serif font-bold text-slate-900 group-hover:text-[#0B4236] transition-colors line-clamp-1"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {room.roomName}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {room.description || 'Không gian sang trọng, dịch vụ 5 sao với đầy đủ tiện nghi cao cấp.'}
          </p>
        </div>

        {/* Room Features Icons */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-amber-500/10 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-600 shrink-0" />
            <span>2 Khách</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-amber-600 shrink-0" />
            <span>1 Giường King</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">{room.roomType === 'Suite' ? 'View Biển' : 'View Vườn'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2.5">
          <Link
            to={`/rooms/${room.id}`}
            className="flex-1 text-center py-2.5 px-3 rounded-xl border border-slate-300 hover:border-amber-500 text-xs font-semibold text-slate-700 hover:text-amber-700 hover:bg-amber-50/50 transition-all duration-300"
          >
            Xem Chi Tiết
          </Link>

          <button
            onClick={() => onBookNow && onBookNow(room)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-1.5"
          >
            <span>Đặt Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
