import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showTagline = true, 
  className = '',
  onClick 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Dragon Gamepad Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(0,210,255,0.45)]">
          <defs>
            <linearGradient id="drukGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#00A3FF" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="dragonHorn" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0084FF" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>
          </defs>
          
          {/* Dragon Silhouette & Crest */}
          <path
            d="M 50 4 
               C 68 8, 88 24, 90 48 
               C 92 72, 74 92, 50 96 
               C 34 96, 20 86, 12 72 
               C 8 64, 8 50, 14 40
               C 18 34, 26 28, 30 20
               C 34 14, 38 6, 50 4 Z"
            fill="url(#drukGlow)"
          />
          {/* Dragon Spikes / Horns */}
          <path
            d="M 28 22 C 34 16, 42 12, 50 6 C 45 15, 42 22, 38 28 Z
               M 46 22 C 55 16, 68 12, 78 8 C 72 18, 66 26, 60 30 Z"
            fill="url(#dragonHorn)"
            opacity="0.9"
          />
          
          {/* Inner Controller Pad Cutout (Dark) */}
          <path
            d="M 26 50 C 26 44, 30 40, 38 40 L 62 40 C 70 40, 74 44, 74 50 L 76 68 C 77 76, 70 82, 62 78 L 56 74 C 52 72, 48 72, 44 74 L 38 78 C 30 82, 23 76, 24 68 Z"
            fill="#070C12"
          />

          {/* D-Pad on Left */}
          <path
            d="M 36 53 H 40 V 49 H 44 V 53 H 48 V 57 H 44 V 61 H 40 V 57 H 36 Z"
            fill="#00E5FF"
          />

          {/* Action Buttons on Right (4 Dots) */}
          <circle cx="64" cy="52" r="2.2" fill="#00E5FF" />
          <circle cx="60" cy="56" r="2.2" fill="#38BDF8" />
          <circle cx="68" cy="56" r="2.2" fill="#38BDF8" />
          <circle cx="64" cy="60" r="2.2" fill="#00E5FF" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-['Rajdhani',sans-serif] font-black tracking-tight leading-none ${textSizes[size]}`}>
          <span className="text-white drop-shadow-sm">Druk</span>
          <span className="text-[#00D2FF] drop-shadow-[0_0_10px_rgba(0,210,255,0.4)]">GG</span>
        </div>
        {showTagline && (
          <span className="text-[9px] font-mono tracking-[0.22em] text-slate-400 uppercase mt-0.5 font-semibold">
            PLAY · TRADE · LEVEL UP
          </span>
        )}
      </div>
    </div>
  );
};
