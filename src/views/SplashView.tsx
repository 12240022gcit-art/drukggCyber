import React from 'react';
import { ScreenType } from '../models/marketplace';
import { Logo } from '../components/Logo';
import { MLBB_IMAGE } from '../models/catalogPresentation';
import { ArrowRight } from 'lucide-react';

interface SplashViewProps {
  onNavigate: (screen: ScreenType) => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[85vh] w-full rounded-3xl overflow-hidden border border-[#1E3048] bg-[#070C12] shadow-2xl flex flex-col justify-between p-8 md:p-14">
      
      {/* Background fantasy hero artwork matching Wireframe Image 12 */}
      <div className="absolute inset-0 z-0">
        <img
          src={MLBB_IMAGE}
          alt="DrukGG Champion Art"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top opacity-55 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070C12] via-[#070C12]/70 to-[#070C12]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00D2FF]/20 via-transparent to-transparent" />
      </div>

      {/* Top Branding Section matching Wireframe Image 12 */}
      <div className="relative z-10 flex flex-col items-center text-center pt-8 space-y-6">
        
        {/* Large Dragon Gamepad Emblem & Brand */}
        <Logo size="xl" showTagline={false} />

        <div className="flex items-center gap-6 text-sm font-mono tracking-[0.3em] text-[#00D2FF] font-bold uppercase drop-shadow-md">
          <span>PLAY</span>
          <span className="text-slate-600">·</span>
          <span>TRADE</span>
          <span className="text-slate-600">·</span>
          <span>LEVEL UP</span>
        </div>

        <p className="text-xs md:text-sm text-slate-300 font-mono max-w-md mx-auto pt-2 leading-relaxed">
          Browse gaming account listings. Payments and transfers are coordinated manually with DrukGG support.
        </p>
      </div>

      {/* Bottom Action Section matching Wireframe Image 12 ("Get Started") */}
      <div className="relative z-10 max-w-md mx-auto w-full pb-6 space-y-4">
        <button
          onClick={() => onNavigate('home')}
          className="w-full py-4 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-base font-bold uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,210,255,0.5)] flex items-center justify-center gap-3"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400">
          <button 
            onClick={() => onNavigate('browse')}
            className="hover:text-[#00D2FF] transition-colors"
          >
            Browse Listings
          </button>
          <span>·</span>
          <button 
            onClick={() => onNavigate('signin')}
            className="hover:text-[#00D2FF] transition-colors"
          >
            Sign In
          </button>
          <span>·</span>
          <button 
            onClick={() => onNavigate('sell')}
            className="hover:text-[#00D2FF] transition-colors"
          >
            Sell Account
          </button>
        </div>
      </div>

    </div>
  );
};
