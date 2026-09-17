import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { Sparkles, Utensils, Waves, Car, Clock, CheckCircle2, Phone, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { APP_SETTINGS } from '../constants/settings';

const ServicesPage = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const servicesList = [
    {
      id: 1,
      name: 'Bữa Sáng Buffet Quốc Tế',
      price: 100000,
      description: 'Buffet sáng hảo hạng với hơn 60 món ăn kết hợp tinh hoa ẩm thực Á - Âu và quầy hải sản tươi sống.',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
      hours: '06:00 - 10:30',
      location: 'Nhà Hàng Grand Lumière (Tầng 1)',
    },
    {
      id: 2,
      name: 'Lumière Spa Trị Liệu Hoàng Gia',
      price: 300000,
      description: 'Liệu trình massage đá nóng Himalaya và tinh dầu thiên nhiên nguyên chất giúp phục hồi năng lượng tối đa.',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
      hours: '09:00 - 22:00',
      location: 'Khu Spa & Wellness (Tầng 3)',
    },
    {
      id: 3,
      name: 'Bữa Tối Lãng Mạn Bên Bờ Biển',
      price: 150000,
      description: 'Set menu ẩm thực Pháp 5 món dưới ánh nến và tiếng sóng biển rì rào, thích hợp cho các cặp đôi.',
      imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&q=80',
      hours: '18:00 - 22:30',
      location: 'Bãi Biển Riêng Biệt',
    },
    {
      id: 4,
      name: 'Xe Đưa Đón VIP Sân Bay 2 Chiều',
      price: 200000,
      description: 'Đưa đón tận cửa với tài xế chuyên nghiệp, nước uống thượng hạng và khăn lạnh thơm thảo mộc.',
      imageUrl: 'https://images.unsplash.com/photo-1583301284852-f72f359cd88b?w=600&q=80',
      hours: 'Phục vụ 24/7',
      location: 'Sân Bay Quốc Tế & Resort',
    },
    {
      id: 5,
      name: 'Trà Chiều Hoàng Gia Anh Quốc',
      price: 90000,
      description: 'Thưởng thức trà Earl Grey thượng hạng cùng các loại bánh ngọt macarons, scones và finger sandwiches cổ điển.',
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
      hours: '14:00 - 17:00',
      location: 'The Palm Lounge (Sảnh Chính)',
    },
    {
      id: 6,
      name: 'Dịch Vụ Giặt Ủi Chuyên Nghiệp',
      price: 50000,
      description: 'Chăm sóc trang phục cao cấp bằng công nghệ giặt khô sinh học, giao nhận tận phòng trong vòng 6 giờ.',
      imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80',
      hours: '07:00 - 20:00',
      location: 'Dịch vụ tại phòng',
    },
    {
      id: 7,
      name: 'Thuê Xe Đạp Thể Thao Cao Cấp',
      price: 30000,
      description: 'Khám phá bán đảo Sơn Trà và cung đường ven biển tuyệt đẹp trên những chiếc xe đạp thể thao hiện đại.',
      imageUrl: 'https://images.unsplash.com/photo-1532274402917-5aadf881bdf8?w=600&q=80',
      hours: '06:00 - 18:00',
      location: 'Quầy Concierge',
    },
  ];

  const formatPrice = (val) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const handleOpenBooking = (svc) => {
    setSelectedService(svc);
    form.setFieldsValue({
      serviceName: svc.name,
      date: dayjs(),
      time: '10:00',
      guests: 2,
    });
    setBookingModalOpen(true);
  };

  const handleBookSubmit = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBookingModalOpen(false);
      message.success(`Đã tiếp nhận yêu cầu đặt dịch vụ "${selectedService?.name}"! Bộ phận Concierge sẽ liên hệ xác nhận ngay.`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-24">
      {/* Header Banner */}
      <div className="bg-[#062C24] text-white py-16 px-4 mb-12 border-b border-amber-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Trải Nghiệm Chuẩn Mực Quốc Tế
          </span>
          <h1
            className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Dịch Vụ & Trải Nghiệm 5 Sao
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Từ những bữa tiệc ẩm thực tinh tế đến liệu trình phục hồi sức khỏe đỉnh cao,
            chúng tôi mang đến sự hoàn hảo trong từng khoảnh khắc nghỉ dưỡng của quý khách.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((svc) => (
            <motion.div
              key={svc.id}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-amber-500/20 hover:border-amber-400/50 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="h-56 w-full overflow-hidden relative">
                  <img
                    src={svc.imageUrl}
                    alt={svc.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold font-serif text-amber-300 border border-amber-400/30">
                    {formatPrice(svc.price)}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3
                    className="text-2xl font-serif font-bold text-slate-900"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {svc.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {svc.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Thời gian: {svc.hours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Địa điểm: {svc.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleOpenBooking(svc)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md shadow-amber-500/20 transition-all"
                >
                  Đăng Ký Trải Nghiệm Dịch Vụ
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Service Booking Modal */}
      <Modal
        open={bookingModalOpen}
        onCancel={() => setBookingModalOpen(false)}
        footer={null}
        width={480}
        centered
        destroyOnClose
      >
        <div className="pt-2 pb-4">
          <h3 className="text-2xl font-serif font-bold text-slate-900">
            Đặt Dịch Vụ: {selectedService?.name}
          </h3>
          <p className="text-xs text-amber-800 font-bold mt-1">
            Đơn giá: {formatPrice(selectedService?.price)}
          </p>

          <Form form={form} layout="vertical" onFinish={handleBookSubmit} className="mt-4" requiredMark={false}>
            <Form.Item
              name="guestName"
              label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Họ & Tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input size="large" placeholder="Nguyễn Văn A" className="rounded-xl border-slate-300" />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Số Điện Thoại / Số Phòng</span>}
              rules={[{ required: true, message: 'Vui lòng nhập SĐT hoặc số phòng' }]}
              initialValue={APP_SETTINGS.contact.hotline}
            >
              <Input size="large" placeholder={APP_SETTINGS.contact.hotline} className="rounded-xl border-slate-300" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="date"
                label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Ngày Sử Dụng</span>}
                rules={[{ required: true }]}
              >
                <DatePicker size="large" format="DD/MM/YYYY" className="w-full rounded-xl" />
              </Form.Item>

              <Form.Item
                name="time"
                label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Khung Giờ</span>}
                rules={[{ required: true }]}
              >
                <Select size="large" className="rounded-xl">
                  <Select.Option value="08:00">08:00 Sáng</Select.Option>
                  <Select.Option value="10:00">10:00 Sáng</Select.Option>
                  <Select.Option value="14:00">14:00 Chiều</Select.Option>
                  <Select.Option value="16:00">16:00 Chiều</Select.Option>
                  <Select.Option value="19:00">19:00 Tối</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="note"
              label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Ghi Chú Yêu Cầu</span>}
            >
              <Input.TextArea rows={2} placeholder="Yêu cầu dị ứng thức ăn, dịch chuyển thời gian..." className="rounded-xl border-slate-300" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 border-none font-bold uppercase tracking-wider text-xs shadow-md shadow-amber-500/20"
            >
              Gửi Yêu Cầu Đặt Dịch Vụ
            </Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ServicesPage;
