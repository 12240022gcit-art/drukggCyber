import React from 'react';
import { ScreenType } from '../models/marketplace';
import { Check, Clock } from 'lucide-react';

interface OrderSuccessViewProps {
  onNavigate: (screen: ScreenType) => void;
  orderNumber?: string;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  onNavigate,
  orderNumber = '#1023',
}) => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-8">
      
      {/* Big Circular Green Checkmark matching Wireframe Image 4 */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
            <Check className="w-12 h-12 text-[#10B981] stroke-[3]" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D2FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-[#00D2FF] items-center justify-center text-[10px] font-mono font-bold text-[#070C12]">
              ✓
            </span>
          </span>
        </div>
      </div>

      {/* Main Headline & Subtitle matching Wireframe Image 4 */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-sm md:text-base font-mono text-slate-300 max-w-md mx-auto leading-relaxed">
          Order <strong className="text-[#00D2FF]">{orderNumber}</strong> is recorded as payment pending. This app does not receive or hold funds.
        </p>
      </div>

      {/* Order Status Timeline Card */}
      <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E3048] pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-[#00D2FF]" />
            <span>Next Step: Payment Verification</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 font-semibold">
            Payment Pending
          </span>
        </div>

        <div className="space-y-3 text-xs font-mono text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#16253B] text-[#00D2FF] flex items-center justify-center font-bold text-[11px] shrink-0 border border-[#00D2FF]/40">
              1
            </div>
            <div>
              <p className="text-white font-semibold">Payment Verification Pending</p>
              <p className="text-slate-400 text-[11px]">Contact DrukGG support for payment instructions and confirm them before sending funds.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#16253B] text-[#00D2FF] flex items-center justify-center font-bold text-[11px] shrink-0 border border-[#00D2FF]/40">
              2
            </div>
            <div>
              <p className="text-white font-semibold">Seller Handover</p>
              <p className="text-slate-400 text-[11px]">Coordinate the transfer directly and never share passwords or one-time codes in chat.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#16253B] text-slate-500 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">
              3
            </div>
            <div>
              <p className="text-slate-400 font-semibold">Credentials Transfer</p>
              <p className="text-slate-500 text-[11px]">Account credentials are not stored or delivered by this app.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons matching Wireframe Image 4 ("VIEW MY ORDERS" & "Continue Shopping") */}
      <div className="space-y-3 max-w-md mx-auto pt-2">
        <button
          onClick={() => onNavigate('orders')}
          className="w-full py-4 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)]"
        >
          VIEW MY ORDERS
        </button>

        <button
          onClick={() => onNavigate('browse')}
          className="w-full py-3.5 rounded-xl bg-transparent text-[#00D2FF] hover:bg-[#111C2B] border border-[#00D2FF]/60 font-mono text-sm font-semibold transition-colors"
        >
          Continue Shopping
        </button>
      </div>

    </div>
  );
};
