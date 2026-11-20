import React from 'react';
import { ScreenType } from '../models/marketplace';
import { ArrowRight, FileText, Zap } from 'lucide-react';

interface SellLandingViewProps {
  onNavigate: (screen: ScreenType) => void;
}

export const SellLandingView: React.FC<SellLandingViewProps> = ({ onNavigate }) => {
  const steps = [
    {
      num: 1,
      title: 'Submit Account',
      desc: 'Fill in your account details, skins, rank, and server.',
      icon: FileText,
    },
    {
      num: 2,
      title: 'Submission Review',
      desc: 'Our team reviews your account submission and security details.',
    },
    {
      num: 3,
      title: 'Review Listing',
      desc: 'Review the listing details before it is published to buyers.',
    },
    {
      num: 4,
      title: 'Get Paid',
      desc: 'Payout details are coordinated after external payment verification.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      
      {/* Hero Header matching Wireframe Image 9 */}
      <div className="text-center space-y-4 pt-4 max-w-2xl mx-auto">
        <span className="px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-mono font-semibold border border-[#00D2FF]/20">
          Account listing workflow
        </span>
        <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight">
          Sell Your Account
        </h1>
        <p className="text-base text-slate-300 font-mono leading-relaxed">
          Submit your account for review and coordinate payment arrangements with DrukGG support.
        </p>
      </div>

      {/* 4 Steps Section matching Wireframe Image 9 (Desktop 4-column flow) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {steps.map((step) => {
          return (
            <div
              key={step.num}
              className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 space-y-4 relative hover:border-[#00D2FF]/50 transition-all hover:-translate-y-1 group"
            >
              {/* Step Number Circle matching Wireframe Image 9 (cyan circle with number) */}
              <div className="w-12 h-12 rounded-full bg-[#00D2FF] text-[#070C12] font-mono font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.4)] group-hover:scale-105 transition-transform">
                {step.num}
              </div>

              <div className="space-y-2">
                <h3 className="font-mono font-bold text-white text-base">
                  {step.title}
                </h3>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instant Estimation & Trust Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#111C2B] to-[#16273E] border border-[#1E3048] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 text-[#00D2FF] text-xs font-mono font-bold">
            <Zap className="w-4 h-4" />
            <span>Seller Payout Workflow</span>
          </div>
          <h3 className="text-2xl font-mono font-bold text-white">
            Ready to list your MLBB, eFootball, or PUBG account?
          </h3>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            Listing status is tracked in your account. Payments are arranged manually; no bank or escrow service is integrated.
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          {/* Cyan CTA matching Wireframe Image 9 ("Start Selling") */}
          <button
            onClick={() => onNavigate('submit-account')}
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center justify-center gap-2"
          >
            <span>Start Selling</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
