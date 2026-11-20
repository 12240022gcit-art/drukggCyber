import React from 'react';
import { ScreenType } from '../../models/marketplace';

interface PrimaryNavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({ currentScreen, onNavigate }) => (
  <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
    <button
      onClick={() => onNavigate('home')}
      className={`transition-colors py-1 ${
        currentScreen === 'home'
          ? 'text-[#00D2FF] font-semibold border-b-2 border-[#00D2FF]'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      Home
    </button>
    <button
      onClick={() => onNavigate('browse')}
      className={`transition-colors py-1 ${
        currentScreen === 'browse' || currentScreen === 'detail' || currentScreen === 'checkout'
          ? 'text-[#00D2FF] font-semibold border-b-2 border-[#00D2FF]'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      Browse Accounts
    </button>
    <button
      onClick={() => onNavigate('sell')}
      className={`transition-colors py-1 ${
        currentScreen === 'sell' || currentScreen === 'submit-account' || currentScreen === 'submit-success'
          ? 'text-[#00D2FF] font-semibold border-b-2 border-[#00D2FF]'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      Sell Account
    </button>
    <button
      onClick={() => onNavigate('listings')}
      className={`transition-colors py-1 relative ${
        currentScreen === 'listings' || currentScreen === 'orders' || currentScreen === 'order-success'
          ? 'text-[#00D2FF] font-semibold border-b-2 border-[#00D2FF]'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      Listings
      <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono bg-[#00D2FF]/20 text-[#00D2FF] rounded">
        Orders &amp; Sale
      </span>
    </button>
  </nav>
);
