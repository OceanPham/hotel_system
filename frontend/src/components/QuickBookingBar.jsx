import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Select } from 'antd';
import { Calendar, Users, BedDouble, Search, Sparkles } from 'lucide-react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const QuickBookingBar = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([dayjs(), dayjs().add(2, 'day')]);
  const [roomType, setRoomType] = useState('ALL');
  const [guests, setGuests] = useState('2');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (roomType && roomType !== 'ALL') {
      params.append('type', roomType);
    }
    if (guests) {
      params.append('guests', guests);
    }
    if (dates && dates[0] && dates[1]) {
      params.append('checkIn', dates[0].format('YYYY-MM-DD'));
      params.append('checkOut', dates[1].format('YYYY-MM-DD'));
    }
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-6 border border-amber-400/30">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Dates Range */}
        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Ngày Nhận & Trả Phòng</span>
          </label>
          <RangePicker
            value={dates}
            onChange={(val) => setDates(val)}
            format="DD/MM/YYYY"
            size="large"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            className="w-full border-none p-0 focus:ring-0 shadow-none text-slate-800 font-semibold"
          />
        </div>

        {/* Room Type */}
        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
            <BedDouble className="w-4 h-4 text-amber-600" />
            <span>Hạng Phòng</span>
          </label>
          <Select
            value={roomType}
            onChange={setRoomType}
            size="large"
            className="w-full luxury-select font-semibold"
            variant="borderless"
            options={[
              { value: 'ALL', label: 'Tất cả hạng phòng' },
              { value: 'Standard', label: 'Standard Room' },
              { value: 'Deluxe', label: 'Deluxe Suite' },
              { value: 'Suite', label: 'Royal Ocean Suite' },
            ]}
          />
        </div>

        {/* Guests */}
        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Số Khách</span>
          </label>
          <Select
            value={guests}
            onChange={setGuests}
            size="large"
            className="w-full luxury-select font-semibold"
            variant="borderless"
            options={[
              { value: '1', label: '1 Khách (Phòng đơn)' },
              { value: '2', label: '2 Khách (Cặp đôi)' },
              { value: '3', label: '3 Khách (Gia đình nhỏ)' },
              { value: '4', label: '4+ Khách (Gia đình/Nhóm)' },
            ]}
          />
        </div>

        {/* Search CTA */}
        <div className="pt-2 md:pt-0">
          <button
            onClick={handleSearch}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search className="w-4 h-4 text-slate-950" />
            <span>Tìm Phòng Trống</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickBookingBar;
