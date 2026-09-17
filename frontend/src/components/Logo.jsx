import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ variant = 'light', size = 'default' }) => {
  const isDark = variant === 'dark';
  
  return (
    <Link to="/" className="group flex items-center gap-3.5 transition-transform duration-300 hover:scale-[1.02]">
      {/* SVG Royal Gold Monogram Crest */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size === 'large' ? '54' : '44'}
          height={size === 'large' ? '54' : '44'}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-700 group-hover:rotate-12"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5DF9E" />
              <stop offset="45%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#99751A" />
            </linearGradient>
            <linearGradient id="emeraldBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#073B30" />
              <stop offset="100%" stopColor="#031A15" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Shield / Circle with gold filigree */}
          <circle cx="50" cy="50" r="46" fill="url(#emeraldBg)" stroke="url(#goldGradient)" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="41" stroke="url(#goldGradient)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.8" />

          {/* Star Crest Top */}
          <path d="M50 14 L52 20 L58 20 L53 24 L55 30 L50 26 L45 30 L47 24 L42 20 L48 20 Z" fill="url(#goldGradient)" />

          {/* Center Monogram "L" in Royal Typography */}
          <path
            d="M44 32 C44 30 46 30 48 30 L48 64 C48 66 52 67 58 67 L62 67 C63 67 64 68 64 69 C64 70 63 71 61 71 L39 71 C38 71 37 70 37 69 C37 68 38 67 40 67 C44 67 44 65 44 64 L44 32 Z"
            fill="url(#goldGradient)"
            filter="url(#goldGlow)"
          />

          {/* Royal Symmetrical Laurels bottom */}
          <path
            d="M26 68 C32 78 42 82 50 82 C58 82 68 78 74 68 C68 74 58 78 50 78 C42 78 32 74 26 68 Z"
            fill="url(#goldGradient)"
            opacity="0.9"
          />
        </svg>

        {/* Ambient Gold Glow Dot */}
        <div className="absolute -inset-1 bg-amber-400/20 blur-md rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <span
          className={`font-serif tracking-[0.2em] font-semibold uppercase leading-none transition-colors duration-300 ${
            size === 'large' ? 'text-2xl' : 'text-lg'
          } ${isDark ? 'text-slate-900' : 'text-white'}`}
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          LUMIÈRE
        </span>
        <span
          className="text-[9px] tracking-[0.38em] uppercase font-medium text-[#D4AF37] mt-1 flex items-center gap-1.5"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <span className="w-2 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
          HOTEL & RESORT
          <span className="w-2 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </span>
      </div>
    </Link>
  );
};

export default Logo;
