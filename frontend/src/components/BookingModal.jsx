import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, message } from 'antd';
import { Calendar, Users, ShieldCheck, Sparkles, CreditCard, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../api';
import { APP_SETTINGS } from '../constants/settings';

const { RangePicker } = DatePicker;

const BookingModal = ({ open, onCancel, room, onSuccess }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [nights, setNights] = useState(1);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  const basePrice = room?.basePrice || 500000;
  const roomTotal = basePrice * nights;
  const tax = Math.round(roomTotal * 0.1);
  const grandTotal = roomTotal + tax;

  useEffect(() => {
    if (open) {
      setBookingSuccessData(null);
      form.setFieldsValue({
        fullName: user?.fullName || 'Khách Hàng',
        phone: user?.phone || APP_SETTINGS.contact.hotline,
        email: user?.email || APP_SETTINGS.contact.email,
        dates: [dayjs(), dayjs().add(1, 'day')],
        bookingType: 'Day',
        note: '',
      });
      setNights(1);
    }
  }, [open, user, form]);

  const handleDateChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      const diff = dates[1].diff(dates[0], 'day');
      setNights(diff > 0 ? diff : 1);
    } else {
      setNights(1);
    }
  };

  const handleSubmit = async (values) => {
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập để hoàn tất đặt phòng!');
      openAuthModal('login');
      return;
    }

    setLoading(true);
    try {
      const [checkIn, checkOut] = values.dates;
      const payload = {
        fullName: values.fullName,
        roomNumber: room.roomNumber,
        checkInDate: checkIn.format('YYYY-MM-DD'),
        checkOutDate: checkOut.format('YYYY-MM-DD'),
        bookingType: values.bookingType || 'Day',
        note: values.note || '',
        status: 'Confirmed',
      };

      const res = await bookingApi.createBooking(payload);
      setLoading(false);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#0B4236', '#F5DF9E', '#E5C158'],
      });

      setBookingSuccessData(res?.data || { id: Math.floor(Math.random() * 1000) + 10 });
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo đơn đặt phòng';
      message.error(errMsg);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
      destroyOnClose
      className="luxury-booking-modal"
    >
      {!bookingSuccessData ? (
        <div className="pt-2">
          {/* Header */}
          <div className="border-b border-amber-500/20 pb-4 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
              Đặt Phòng Trực Tuyến
            </span>
            <h2
              className="text-2xl font-serif font-bold text-slate-900 mt-1"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {room?.roomName || 'Phòng Khách Sạn'}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Hạng: <strong>{room?.roomType}</strong></span>
              <span>•</span>
              <span>Số phòng: <strong>#{room?.roomNumber}</strong></span>
              <span>•</span>
              <span>Đơn giá: <strong className="text-amber-700">{formatPrice(basePrice)}/đêm</strong></span>
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            {/* Dates Picker */}
            <Form.Item
              name="dates"
              label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Thời Gian Lưu Trú</span>}
              rules={[{ required: true, message: 'Vui lòng chọn ngày nhận và trả phòng' }]}
            >
              <RangePicker
                size="large"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                onChange={handleDateChange}
                className="w-full rounded-xl border-slate-300 py-2.5"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="fullName"
                label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Họ & Tên Khách Hàng</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input size="large" className="rounded-xl border-slate-300 py-2" />
              </Form.Item>

              <Form.Item
                name="phone"
                label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Số Điện Thoại</span>}
                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
              >
                <Input size="large" className="rounded-xl border-slate-300 py-2" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="email"
                label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Nhận Xác Nhận</span>}
                rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input size="large" className="rounded-xl border-slate-300 py-2" />
              </Form.Item>

              <Form.Item
                name="bookingType"
                label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Hình Thức Thuê</span>}
              >
                <Select size="large" className="rounded-xl">
                  <Select.Option value="Day">Theo Ngày (Day)</Select.Option>
                  <Select.Option value="Night">Theo Đêm (Night)</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="note"
              label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Yêu Cầu Đặc Biệt (Tùy chọn)</span>}
            >
              <Input.TextArea rows={2} placeholder="Ví dụ: Giường đôi, tầng cao, nhận phòng sớm..." className="rounded-xl border-slate-300" />
            </Form.Item>

            {/* Price Summary Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 mb-6">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tiền phòng ({nights} đêm × {formatPrice(basePrice)}):</span>
                <span className="font-semibold text-slate-800">{formatPrice(roomTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Thuế VAT & Phí dịch vụ (10%):</span>
                <span className="font-semibold text-slate-800">{formatPrice(tax)}</span>
              </div>
              <div className="pt-2 border-t border-amber-500/20 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Tổng Thanh Toán Dự Kiến:</span>
                <span className="text-xl font-bold font-serif text-amber-800">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button size="large" onClick={onCancel} className="flex-1 rounded-xl h-11">
                Hủy Bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="flex-1 rounded-xl h-11 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 border-none font-bold uppercase tracking-wider text-xs text-slate-950 shadow-lg shadow-amber-500/30"
              >
                Xác Nhận Đặt Phòng
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        /* Success Screen */
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3
            className="text-2xl font-serif font-bold text-slate-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Đặt Phòng Thành Công!
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Hệ thống đã ghi nhận đơn đặt phòng của quý khách cho phòng <strong>#{room?.roomNumber} ({room?.roomName})</strong>.
            Thông tin chi tiết đã được lưu vào hệ thống.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 inline-block text-left text-xs space-y-1.5 min-w-[280px]">
            <div>Mã đơn đặt phòng: <strong className="text-amber-800">#{bookingSuccessData.bookingId || bookingSuccessData.id || 1}</strong></div>
            <div>Số đêm: <strong>{nights} đêm</strong></div>
            <div>Tổng tiền: <strong className="text-emerald-700 font-bold">{formatPrice(grandTotal)}</strong></div>
            <div>Trạng thái: <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">Đã Xác Nhận</span></div>
          </div>

          <div className="pt-4">
            <Button
              type="primary"
              onClick={onCancel}
              size="large"
              className="rounded-xl px-8 h-10 bg-[#062C24] hover:bg-[#0B4236] border-none font-bold text-xs"
            >
              Hoàn Tất & Đóng
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;
