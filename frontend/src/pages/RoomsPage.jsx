import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Slider, Select, Input, Spin, Empty } from 'antd';
import { Search, SlidersHorizontal, LayoutGrid, List, Sparkles, RotateCcw } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import { roomApi } from '../api';

const RoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'ALL';

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(initialType);
  const [priceRange, setPriceRange] = useState([400000, 2000000]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await roomApi.getAllRooms();
        if (res && res.data) {
          setRooms(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải phòng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Update filter from URL query if changed
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl) {
      setSelectedType(typeFromUrl);
    }
  }, [searchParams]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setPriceRange([400000, 2000000]);
    setSearchParams({});
  };

  const filteredRooms = rooms.filter((r) => {
    // Search keyword
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = r.roomName?.toLowerCase().includes(term);
      const matchDesc = r.description?.toLowerCase().includes(term);
      const matchNumber = r.roomNumber?.includes(term);
      if (!matchName && !matchDesc && !matchNumber) return false;
    }

    // Type
    if (selectedType !== 'ALL') {
      if (r.roomType?.toLowerCase() !== selectedType.toLowerCase()) return false;
    }

    // Price
    const price = r.basePrice || 0;
    if (price < priceRange[0] || price > priceRange[1]) return false;

    return true;
  });

  const formatPrice = (val) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-24">
      {/* Header Banner */}
      <div className="bg-[#062C24] text-white py-16 px-4 mb-12 border-b border-amber-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Dịch Vụ Lưu Trú Chuẩn 5 Sao
          </span>
          <h1
            className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Danh Sách Phòng & Suite Hoàng Gia
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Khám phá trọn vẹn 10 hạng phòng được thiết kế độc bản với đầy đủ tiện nghi xa hoa,
            sẵn sàng đón chào kỳ nghỉ đáng giá của quý khách.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-500/20 mb-10 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Tìm kiếm phòng</span>
              </label>
              <Input
                size="large"
                placeholder="Tên phòng, số phòng, view..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                className="rounded-xl border-slate-300"
              />
            </div>

            {/* Room Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Hạng phòng</span>
              </label>
              <Select
                size="large"
                value={selectedType}
                onChange={(val) => {
                  setSelectedType(val);
                  if (val === 'ALL') {
                    searchParams.delete('type');
                  } else {
                    searchParams.set('type', val);
                  }
                  setSearchParams(searchParams);
                }}
                className="w-full rounded-xl"
                options={[
                  { value: 'ALL', label: 'Tất cả các hạng phòng' },
                  { value: 'Standard', label: 'Standard Room' },
                  { value: 'Deluxe', label: 'Deluxe Suite' },
                  { value: 'Suite', label: 'Royal Ocean Suite' },
                ]}
              />
            </div>

            {/* Price Range Slider */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-700">Khoảng giá / đêm</span>
                <span className="text-amber-800 font-bold">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </span>
              </div>
              <Slider
                range
                min={400000}
                max={2000000}
                step={100000}
                value={priceRange}
                onChange={(val) => setPriceRange(val)}
                tooltip={{ formatter: (val) => formatPrice(val) }}
                className="mt-2"
              />
            </div>

            {/* Reset Button */}
            <div>
              <button
                onClick={resetFilters}
                className="w-full h-10 rounded-xl border border-slate-300 hover:border-amber-600 text-slate-700 hover:text-amber-800 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Results Counter & View Mode Switcher */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div>
              Hiển thị <strong className="text-slate-900 font-bold">{filteredRooms.length}</strong> phòng phù hợp
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Chế độ xem:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg border transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
                title="Lưới"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg border transition-colors ${
                  viewMode === 'list'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
                title="Danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Listing */}
        {loading ? (
          <div className="py-24 text-center">
            <Spin size="large" />
            <p className="text-xs text-amber-800 uppercase tracking-widest font-semibold mt-4">
              Đang tải danh sách phòng...
            </p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl p-12 border border-slate-200">
            <Empty description="Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại" />
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              Xem Tất Cả Phòng
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                : 'flex flex-col gap-6'
            }
          >
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBookNow={(r) => setSelectedRoomForBooking(r)}
              />
            ))}
          </div>
        )}
      </div>

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

export default RoomsPage;
