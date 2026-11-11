import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base tracking-wider',
    md: 'text-lg tracking-wider',
    lg: 'text-xl tracking-wider',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-[#3A0F34] select-none ${className}`}>
      {/* Precision Geometric Monogram Icon for Edenexa */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3A0F34] via-[#270723] to-[#3A0F34] border border-[#EAAA00]/40 shadow-sm group transition-all duration-300 hover:border-[#EAAA00] hover:shadow-[0_0_18px_rgba(234,170,0,0.35)] shrink-0`}>
        <svg
          viewBox="0 0 40 40"
          className="w-3/4 h-3/4 transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="edenexaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#EAAA00" />
              <stop offset="100%" stopColor="#F5B81A" />
            </linearGradient>
            <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Architectural 'E' path */}
          <path
            d="M11 11H29M11 20H24M11 29H29M11 11V29"
            stroke="url(#edenexaGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#subtleGlow)"
          />
          {/* Golden Yellow & White node accents */}
          <circle cx="29" cy="11" r="1.6" fill="#EAAA00" />
          <circle cx="24" cy="20" r="1.6" fill="#FFFFFF" />
          <circle cx="29" cy="29" r="1.6" fill="#EAAA00" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold uppercase font-sans text-[#3A0F34] ${textSizes[size]}`}>
              EDENEXA
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.24em] text-[#EAAA00] font-semibold mt-0.5">
            AI & Web Studio
          </span>
        </div>
      )}
    </div>
  );
};
