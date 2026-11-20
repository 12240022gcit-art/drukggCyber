import React, { useState } from 'react';
import { ScreenType, GameAccount } from '../models/marketplace';
import { ArrowLeft, Check, ShieldCheck, CreditCard, Building2, Smartphone } from 'lucide-react';
import { SecurityNotice } from '../components/SecurityNotice';

interface CheckoutViewProps {
  account: GameAccount;
  onNavigate: (screen: ScreenType) => void;
  onPlaceOrder: (account: GameAccount, paymentMethod: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  account,
  onNavigate,
  onPlaceOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'ewallet' | 'other'>('bank');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = account.price;
  const platformFee = 350;
  const total = price + platformFee;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Back button & Title */}
      <div className="flex items-center justify-between border-b border-[#1E3048] pb-4">
        <button
          onClick={() => onNavigate('detail')}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-[#00D2FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account Details</span>
        </button>
        <span className="text-xs font-mono text-slate-400">
          Payment arranged with DrukGG support
        </span>
      </div>

      <h1 className="text-3xl font-mono font-bold text-white tracking-tight">
        Checkout
      </h1>

      <SecurityNotice title="Payment safety">
        This project does not process payments or automatically hold funds in escrow. Confirm payment instructions directly with DrukGG support, and never share banking passwords or one-time codes.
      </SecurityNotice>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Order Summary (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#111C2B] rounded-xl border border-[#1E3048] p-5 space-y-5">
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Order Summary
            </h2>

            {/* Account Card matching wireframe Image 6 */}
            <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[#1E3048] relative">
                <img
                  src={account.image}
                  alt={account.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-mono font-bold text-white text-sm truncate">
                  {account.title}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {account.rank} <span className="text-slate-600">|</span> lv.{account.level}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono font-semibold">
                    <Check className="w-3 h-3" />
                    Active listing
                  </span>
                  <span className="font-mono font-bold text-sm text-[#00D2FF]">
                    Nu. {account.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown matching wireframe Image 6 */}
            <div className="space-y-3 pt-2 border-t border-[#1E3048] text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Price</span>
                <span className="text-white">Nu. {price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Platform Fee</span>
                <span className="text-white">Nu. {platformFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#1E3048] text-base font-bold">
                <span className="text-white">Total</span>
                <span className="text-[#00D2FF]">Nu. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Escrow Badge */}
          <div className="p-4 rounded-xl bg-[#070C12] border border-[#1E3048] flex items-center gap-3 text-xs font-mono text-slate-300">
            <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Your order total is <strong className="text-white">Nu. {total.toLocaleString()}</strong>. Payment verification and account handover are coordinated manually with DrukGG support.
            </p>
          </div>
        </div>

        {/* Right Column: Payment Method & Actions (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-[#111C2B] rounded-xl border border-[#1E3048] p-6 space-y-6">
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Payment Method
            </h2>

            {/* Radio Options matching wireframe Image 6 */}
            <div className="space-y-3 font-mono text-xs">
              
              {/* Option 1: Bank Transfer (Bhutan) */}
              <div
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank'
                    ? 'bg-[#16253B] border-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.15)]'
                    : 'bg-[#0B131E] border-[#1E3048] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'bank' ? 'border-[#00D2FF] bg-[#00D2FF]' : 'border-slate-500'
                    }`}>
                      {paymentMethod === 'bank' && <div className="w-1.5 h-1.5 rounded-full bg-[#070C12]" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#00D2FF]" />
                      <span className="font-bold text-white text-sm">Bank Transfer (Bhutan)</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#00D2FF] bg-[#00D2FF]/10 px-2 py-0.5 rounded border border-[#00D2FF]/20">
                    Recommended
                  </span>
                </div>

                {paymentMethod === 'bank' && (
                  <div className="mt-4 pt-3 border-t border-[#1E3048] text-[11px] text-slate-300 space-y-1.5 bg-[#0B131E] p-3 rounded-lg">
                    <div className="text-amber-300">
                      Bank transfer instructions are provided by DrukGG support after an order is placed.
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transfer Remarks:</span>
                      <strong className="text-yellow-400">Your order number</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: eWallet (mBOB, B-Kash, TPay) */}
              <div
                onClick={() => setPaymentMethod('ewallet')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'ewallet'
                    ? 'bg-[#16253B] border-[#00D2FF]'
                    : 'bg-[#0B131E] border-[#1E3048] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'ewallet' ? 'border-[#00D2FF] bg-[#00D2FF]' : 'border-slate-500'
                    }`}>
                      {paymentMethod === 'ewallet' && <div className="w-1.5 h-1.5 rounded-full bg-[#070C12]" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-sm">eWallet (mBOB / TPay / Bhutan Pay)</span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'ewallet' && (
                  <div className="mt-3 text-[11px] text-slate-400 bg-[#0B131E] p-3 rounded-lg border border-[#1E3048]">
                    Payment instructions are provided by DrukGG support after the order is placed.
                  </div>
                )}
              </div>

              {/* Option 3: Other Payment Method */}
              <div
                onClick={() => setPaymentMethod('other')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'other'
                    ? 'bg-[#16253B] border-[#00D2FF]'
                    : 'bg-[#0B131E] border-[#1E3048] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'other' ? 'border-[#00D2FF] bg-[#00D2FF]' : 'border-slate-500'
                  }`}>
                    {paymentMethod === 'other' && <div className="w-1.5 h-1.5 rounded-full bg-[#070C12]" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white text-sm">Other (arranged with support)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Checkbox: I agree to Terms & Conditions matching Wireframe Image 6 */}
            <div className="pt-2">
              <label 
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className="flex items-center gap-2.5 cursor-pointer font-mono text-xs text-slate-300 select-none"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  agreedToTerms ? 'bg-[#00D2FF] border-[#00D2FF] text-[#070C12]' : 'border-slate-500 bg-[#0B131E]'
                }`}>
                  {agreedToTerms && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>
                  I agree to the <span className="text-[#00D2FF] underline">Terms & Conditions</span> and Escrow Policy
                </span>
              </label>
            </div>

            {/* CTA matching wireframe Image 6 */}
            <div className="pt-2">
              <button
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await onPlaceOrder(account, paymentMethod);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={!agreedToTerms || isSubmitting}
                className={`w-full py-4 rounded-xl font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${
                  agreedToTerms
                    ? 'bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] cursor-pointer shadow-[0_0_20px_rgba(0,210,255,0.4)]'
                    : 'bg-[#1E3048] text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Placing Order…' : `Confirm Order (Nu. ${total.toLocaleString()})`}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
