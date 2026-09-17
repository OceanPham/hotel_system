import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  FacebookOutlined,
  LinkedinOutlined,
  GithubOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import Logo from './Logo';
import { APP_SETTINGS } from '../constants/settings';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { contact, developer } = APP_SETTINGS;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      message.warning('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    setSubscribed(true);
    message.success('Cảm ơn quý khách đã đăng ký nhận thông tin ưu đãi độc quyền!');
    setEmail('');
  };

  return (
    <footer className="relative bg-[#051F1A] text-slate-300 pt-20 pb-12 overflow-hidden border-t border-amber-500/20">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-amber-500/15">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-6">
            <Logo size="large" variant="light" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Nơi giao hòa giữa kiến trúc hoàng gia tráng lệ và vẻ đẹp thiên nhiên thuần khiết.
              LUMIÈRE PALACE tự hào mang đến những trải nghiệm nghỉ dưỡng xa hoa, riêng tư và hoàn mỹ
              cho giới thượng lưu quốc tế.
            </p>

            {/* Awards & Certifications */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-amber-200/80">
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                <Award className="w-4 h-4 text-amber-400" />
                <span>World Luxury Hotel 2026</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Forbes 5-Star Certified</span>
              </div>
            </div>

            {/* Official Social Links (OceanLabs) */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/5 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 hover:text-amber-300 transition-colors text-sm"
              >
                <FacebookOutlined />
              </a>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/5 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 hover:text-amber-300 transition-colors text-sm"
              >
                <LinkedinOutlined />
              </a>
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full bg-white/5 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 hover:text-amber-300 transition-colors text-sm"
              >
                <GithubOutlined />
              </a>
              <a
                href={contact.threads}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads"
                className="w-9 h-9 rounded-full bg-white/5 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 hover:text-amber-300 transition-colors text-sm font-bold text-xs"
              >
                @
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h3
              className="text-white text-base tracking-widest uppercase font-semibold font-serif border-l-2 border-amber-400 pl-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Phòng & Suite
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/rooms?type=Standard" className="hover:text-amber-300 transition-colors">
                  Standard Collection
                </Link>
              </li>
              <li>
                <Link to="/rooms?type=Deluxe" className="hover:text-amber-300 transition-colors">
                  Deluxe City & Garden
                </Link>
              </li>
              <li>
                <Link to="/rooms?type=Suite" className="hover:text-amber-300 transition-colors">
                  Royal Ocean Suite
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-amber-300 transition-colors">
                  Biệt Thự Tổng Thống
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-amber-300 transition-colors">
                  Ưu Đãi Nghỉ Dưỡng Mùa
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services & Dining */}
          <div className="space-y-4">
            <h3
              className="text-white text-base tracking-widest uppercase font-semibold font-serif border-l-2 border-amber-400 pl-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Dịch Vụ 5 Sao
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services" className="hover:text-amber-300 transition-colors">
                  Fine Dining & Bữa Sáng
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-300 transition-colors">
                  Lumière Spa Trị Liệu
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-300 transition-colors">
                  Hồ Bơi Vô Cực Chân Mây
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-300 transition-colors">
                  Đưa Đón Limousine Sân Bay
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">
                  Dịch Vụ Quản Gia Riêng (Butler)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Official Contact */}
          <div className="space-y-4">
            <h3
              className="text-white text-base tracking-widest uppercase font-semibold font-serif border-l-2 border-amber-400 pl-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Bản Tin Hoàng Gia
            </h3>
            <p className="text-xs text-slate-400">
              Nhận thư mời các sự kiện ẩm thực độc quyền và mã ưu đãi giảm tới 30% cho kỳ nghỉ tiếp theo.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của quý khách..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-amber-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg text-slate-950 font-bold hover:scale-105 transition-transform"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={contact.phoneTel} className="hover:text-amber-300 transition-colors">
                  Hotline: {contact.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={contact.emailMailto} className="hover:text-amber-300 transition-colors">
                  {contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Developer Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p>© 2026 LUMIÈRE PALACE HOTEL & RESORT. All rights reserved.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Phát triển bởi{' '}
              <a
                href={developer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
              >
                {developer.name}
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/helps" className="hover:text-amber-300 transition-colors">
              Chính Sách Bảo Mật
            </Link>
            <Link to="/helps" className="hover:text-amber-300 transition-colors">
              Điều Khoản Dịch Vụ
            </Link>
            <Link to="/contact" className="hover:text-amber-300 transition-colors">
              Bản Đồ Chỉ Đường
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
