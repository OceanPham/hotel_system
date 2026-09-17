import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X, QrCode } from 'lucide-react';
import { Tooltip, Popover } from 'antd';
import { APP_SETTINGS } from '../constants/settings';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { contact } = APP_SETTINGS;

  const zaloQrContent = (
    <div className="p-3 text-center space-y-2">
      <div className="w-40 h-40 bg-slate-100 rounded-xl flex items-center justify-center p-2 border border-slate-200">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(contact.zalo)}`}
          alt="Zalo QR"
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-xs font-bold text-slate-800">Quét mã Zalo</p>
      <p className="text-[11px] text-slate-500">{contact.phoneDisplay}</p>
      <a
        href={contact.zalo}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-3 py-1 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700"
      >
        Mở Zalo Chat
      </a>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Floating Buttons */}
      <div className="flex flex-col gap-2.5">
        {/* Zalo Button */}
        <Popover content={zaloQrContent} title={null} trigger="click" placement="left">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-[#0068FF] text-white shadow-xl shadow-blue-500/30 flex items-center justify-center border-2 border-white hover:brightness-110 transition-all"
            title="Chat Zalo"
          >
            <span className="font-bold text-xs">Zalo</span>
          </motion.button>
        </Popover>

        {/* WhatsApp Button */}
        <Tooltip title="Chat WhatsApp" placement="left">
          <motion.a
            href={contact.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl shadow-green-500/30 flex items-center justify-center border-2 border-white hover:brightness-110 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.a>
        </Tooltip>

        {/* Hotline Call Button with Pulse Wave */}
        <Tooltip title={`Gọi Hotline: ${contact.phoneDisplay}`} placement="left">
          <motion.a
            href={contact.phoneTel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 shadow-xl shadow-amber-500/40 flex items-center justify-center border-2 border-white hover:brightness-110 transition-all"
          >
            <Phone className="w-5 h-5 text-slate-950" />
            <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
          </motion.a>
        </Tooltip>
      </div>
    </div>
  );
};

export default FloatingContact;
