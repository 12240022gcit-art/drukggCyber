import React from 'react';
import { ScreenType } from '../models/marketplace';
import { Check } from 'lucide-react';

interface SubmitSuccessViewProps {
  onNavigate: (screen: ScreenType) => void;
}

export const SubmitSuccessView: React.FC<SubmitSuccessViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-8">
      
      {/* Big Circular Green Checkmark matching Wireframe Image 5 */}
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

      {/* Main Title & Subtitle matching Wireframe Image 5 */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">
          Account Submitted Successfully!
        </h1>
        <p className="text-sm md:text-base font-mono text-slate-300 max-w-sm mx-auto leading-relaxed">
          Your listing is awaiting admin review. You can track its status in your listings.
        </p>
      </div>

      {/* Verification Ticket Card */}
      <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 text-left space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#1E3048] pb-3">
          <span className="text-slate-400">Submission status:</span>
          <strong className="text-amber-400">Under review</strong>
        </div>
        <div className="flex items-center justify-between border-b border-[#1E3048] pb-3">
          <span className="text-slate-400">Review timing:</span>
          <strong className="text-white">Not guaranteed</strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Notification Channel:</span>
          <strong className="text-[#10B981]">In-app status update</strong>
        </div>
      </div>

      {/* Continue Button matching Wireframe Image 5 (Cyan button) */}
      <div className="pt-2">
        <button
          onClick={() => onNavigate('home')}
          className="w-full max-w-md py-4 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)]"
        >
          Continue
        </button>
      </div>

    </div>
  );
};
