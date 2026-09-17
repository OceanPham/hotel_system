import React, { useState } from 'react';
import { Form, Input, Button, Collapse, message } from 'antd';
import { MapPin, Phone, Mail, Clock, Send, Globe, ShieldCheck } from 'lucide-react';
import { APP_SETTINGS } from '../constants/settings';

const ContactPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      form.resetFields();
      message.success('Cảm ơn quý khách đã gửi thông điệp! Đội ngũ Concierge sẽ phản hồi trong vòng 15 phút.');
    }, 800);
  };

  const faqItems = [
    {
      key: '1',
      label: <span className="font-bold text-slate-800 text-sm">Thời gian nhận phòng (Check-in) và trả phòng (Check-out) là khi nào?</span>,
      children: (
        <p className="text-xs text-slate-600 leading-relaxed">
          Thời gian nhận phòng tiêu chuẩn là từ 14:00 và thời gian trả phòng là trước 12:00 trưa.
          Quý khách có nhu cầu nhận phòng sớm hoặc trả phòng muộn vui lòng liên hệ quầy lễ tân hoặc thông báo khi đặt phòng để được sắp xếp miễn phí tùy thuộc vào tình trạng phòng trống.
        </p>
      ),
    },
    {
      key: '2',
      label: <span className="font-bold text-slate-800 text-sm">Chính sách hủy phòng và hoàn tiền như thế nào?</span>,
      children: (
        <p className="text-xs text-slate-600 leading-relaxed">
          LUMIÈRE PALACE áp dụng chính sách hủy phòng linh hoạt: Miễn phí hủy phòng trước 24 giờ kể từ thời điểm nhận phòng.
          Nếu quý khách hủy trong vòng 24 giờ trước giờ nhận phòng, khách sạn sẽ tính phí tương đương đêm đầu tiên.
        </p>
      ),
    },
    {
      key: '3',
      label: <span className="font-bold text-slate-800 text-sm">Khách sạn có dịch vụ đưa đón sân bay không?</span>,
      children: (
        <p className="text-xs text-slate-600 leading-relaxed">
          Có. Chúng tôi cung cấp dịch vụ đưa đón sân bay 2 chiều bằng xe VIP Limousine. Dịch vụ được miễn phí hoàn toàn đối với khách hàng đặt phòng hạng Royal Suite hoặc lưu trú từ 3 đêm trở lên.
        </p>
      ),
    },
    {
      key: '4',
      label: <span className="font-bold text-slate-800 text-sm">Chính sách dành cho trẻ em và giường phụ?</span>,
      children: (
        <p className="text-xs text-slate-600 leading-relaxed">
          Trẻ em dưới 6 tuổi được lưu trú miễn phí và miễn phí buffet sáng khi ngủ chung giường với bố mẹ.
          Trẻ từ 6 - 11 tuổi phụ thu bữa sáng theo quy định. Cũi em bé được cung cấp miễn phí theo yêu cầu.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-24">
      {/* Header Banner */}
      <div className="bg-[#062C24] text-white py-16 px-4 mb-12 border-b border-amber-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Dịch Vụ Chăm Sóc Khách Hàng 24/7
          </span>
          <h1
            className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Liên Hệ & Câu Hỏi Thường Gặp
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Đội ngũ Concierge tận tâm luôn sẵn sàng lắng nghe, giải đáp và phục vụ mọi mong muốn
            của quý khách bất kể thời gian nào.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Contact Form & Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-[#0B2B26] text-white space-y-6 shadow-2xl border border-amber-400/20">
              <h2
                className="text-3xl font-serif font-bold text-white"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Thông Tin Trực Tuyến
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Quý khách có thể liên hệ trực tiếp tới các đường dây chuyên trách để nhận được sự phục vụ nhanh nhất:
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-semibold">Địa chỉ</span>
                    <p className="text-xs text-slate-200">{APP_SETTINGS.contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-semibold">Hotline / Zalo</span>
                    <a href={APP_SETTINGS.contact.phoneTel} className="text-xs text-slate-200 hover:text-amber-300 transition-colors block">
                      {APP_SETTINGS.contact.phoneDisplay} (Phục vụ 24/7)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-semibold">Email Liên Hệ</span>
                    <a href={APP_SETTINGS.contact.emailMailto} className="text-xs text-slate-200 hover:text-amber-300 transition-colors block">
                      {APP_SETTINGS.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-semibold">Đơn Vị Phát Triển</span>
                    <a
                      href={APP_SETTINGS.developer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-200 hover:text-amber-300 transition-colors block font-medium"
                    >
                      {APP_SETTINGS.developer.name} ({APP_SETTINGS.developer.website})
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-semibold">Thời Gian Làm Việc</span>
                    <p className="text-xs text-slate-200">{APP_SETTINGS.contact.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-amber-500/20 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Gửi Thông Điệp Trực Tiếp
              </span>
              <h2
                className="text-3xl font-serif font-bold text-slate-900 mt-1"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Để Lại Yêu Cầu Cho Đội Ngũ Concierge
              </h2>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="name"
                  label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Họ & Tên</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input size="large" placeholder="Nguyễn Văn A" className="rounded-xl border-slate-300" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Email</span>}
                  rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}
                >
                  <Input size="large" placeholder="email@example.com" className="rounded-xl border-slate-300" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="phone"
                  label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Số Điện Thoại</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                  <Input size="large" placeholder={APP_SETTINGS.contact.hotline} className="rounded-xl border-slate-300" />
                </Form.Item>

                <Form.Item
                  name="subject"
                  label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Chủ Đề</span>}
                  initialValue="Đặt phòng nghỉ dưỡng"
                >
                  <Input size="large" className="rounded-xl border-slate-300" />
                </Form.Item>
              </div>

              <Form.Item
                name="message"
                label={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Nội Dung Yêu Cầu</span>}
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <Input.TextArea rows={4} placeholder="Xin cho biết chi tiết yêu cầu của quý khách..." className="rounded-xl border-slate-300" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full sm:w-auto px-8 h-12 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 border-none font-bold uppercase tracking-wider text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-slate-950"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Thông Điệp Tới Concierge</span>
              </Button>
            </Form>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-amber-500/20 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Giải Đáp Thắc Mắc
            </span>
            <h2
              className="text-3xl font-serif font-bold text-slate-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Những Câu Hỏi Thường Gặp
            </h2>
          </div>

          <Collapse
            items={faqItems}
            defaultActiveKey={['1']}
            expandIconPosition="end"
            className="luxury-collapse bg-transparent border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
