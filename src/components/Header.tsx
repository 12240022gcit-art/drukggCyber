import React from 'react';
import { Logo } from './Logo';
import { ScreenType } from '../models/marketplace';
import { PrimaryNavigation } from './navigation/PrimaryNavigation';
import { Search, PlusCircle, Bell } from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAdminChat: () => void;
  unreadAdminAlertsCount?: number;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenAdminChat,
  unreadAdminAlertsCount = 2,
  userName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B131E]/95 backdrop-blur-md border-b border-[#1A283B]">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Zone */}
        <Logo 
          size="md" 
          onClick={() => onNavigate('home')} 
          className="hover:opacity-95 transition-opacity"
        />

        {/* Search Bar (Desktop Integrated) */}
        <div className="hidden lg:flex flex-1 max-w-md items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search games, accounts..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentScreen !== 'browse' && e.target.value.length > 0) {
                onNavigate('browse');
              }
            }}
            className="w-full bg-[#111C2B] text-slate-200 placeholder-slate-500 text-sm font-mono rounded-lg pl-10 pr-4 py-2 border border-[#1E3048] focus:border-[#00D2FF] focus:outline-none transition-colors"
          />
        </div>

        <PrimaryNavigation currentScreen={currentScreen} onNavigate={onNavigate} />

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          
          {/* Admin Notification & Direct Chat Bell */}
          <button
            onClick={onOpenAdminChat}
            className="relative p-2 rounded-lg bg-[#111C2B] text-slate-300 hover:text-white border border-[#1E3048] hover:border-[#00D2FF]/50 transition-colors"
            title="DrukGG Admin Desk (Notifications & Two-Way Chat)"
          >
            <Bell className="w-4 h-4" />
            {unreadAdminAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D2FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00D2FF] text-[#070C12] font-mono text-[9px] font-black items-center justify-center">
                  {unreadAdminAlertsCount}
                </span>
              </span>
            )}
          </button>

          {/* Sell CTA button */}
          <button
            onClick={() => onNavigate('sell')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-[#142337] hover:bg-[#1a2d46] text-[#00D2FF] border border-[#00D2FF]/30 transition-all hover:border-[#00D2FF]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List Account</span>
          </button>

          {/* Profile Quick Access */}
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-lg bg-[#111C2B] border border-[#1E3048] hover:border-slate-600 transition-colors"
            title={userName ? `View Profile (${userName})` : 'Sign In / Register'}
          >
            <span className="text-xs font-medium text-slate-300 hidden lg:inline">
              {userName || 'Sign In'}
            </span>
            <div className="w-7 h-7 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-mono text-xs font-bold">
              {(userName || 'DG').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};
