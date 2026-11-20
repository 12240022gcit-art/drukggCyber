import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Lock, Headphones, RefreshCw } from 'lucide-react';
import { ScreenType } from '../models/marketplace';

interface FooterProps {
  onNavigate: (screen: ScreenType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#070C12] border-t border-[#162335] mt-20 pt-16 pb-28">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Value Props Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#162335]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#00D2FF]/10 text-[#00D2FF] flex items-center justify-center shrink-0 border border-[#00D2FF]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Reviewed Marketplace Listings</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                New seller submissions are reviewed before they are published to the marketplace.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#00D2FF]/10 text-[#00D2FF] flex items-center justify-center shrink-0 border border-[#00D2FF]/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Payment Status Tracking</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Orders record admin-updated status; this app does not receive payments or hold funds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#00D2FF]/10 text-[#00D2FF] flex items-center justify-center shrink-0 border border-[#00D2FF]/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Transfer Coordination</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Buyers and sellers coordinate account transfer details manually.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#00D2FF]/10 text-[#00D2FF] flex items-center justify-center shrink-0 border border-[#00D2FF]/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Support Channels</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Contact information is listed in the profile support section.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-[#162335]">
          <div className="col-span-2">
            <Logo size="md" />
            <p className="text-xs text-slate-400 mt-3 max-w-sm leading-relaxed">
              DrukGG is a gaming account listing marketplace. Review listing details and confirm payment instructions with support before proceeding.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Currency:</span>
              <span className="text-[#00D2FF] font-semibold bg-[#111C2B] px-2 py-0.5 rounded border border-[#1E3048]">
                Bhutanese Ngultrum (Nu.)
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
              Marketplace
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('browse')} className="hover:text-[#00D2FF] transition-colors">
                  Mobile Legends Accounts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('browse')} className="hover:text-[#00D2FF] transition-colors">
                  eFootball Accounts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('browse')} className="hover:text-[#00D2FF] transition-colors">
                  PUBG Mobile Accounts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('browse')} className="hover:text-[#00D2FF] transition-colors">
                  Free Fire Accounts
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
              Quick Actions
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('sell')} className="hover:text-[#00D2FF] transition-colors">
                  Sell Your Account
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-[#00D2FF] transition-colors">
                  Track My Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('profile')} className="hover:text-[#00D2FF] transition-colors">
                  User Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('signin')} className="hover:text-[#00D2FF] transition-colors">
                  Sign In / Register
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
              Payments
            </h5>
            <p className="text-xs text-slate-400">
              No payment gateway or automated escrow is integrated. Payment is arranged manually with support.
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 DrukGG Marketplace (Bhutan). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Escrow Safety Policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
