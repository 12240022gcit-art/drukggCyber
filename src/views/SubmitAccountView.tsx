import React, { useState } from 'react';
import { ScreenType } from '../models/marketplace';
import { ArrowLeft, Check, Shield } from 'lucide-react';
import { SecurityNotice } from '../components/SecurityNotice';

interface SubmitAccountViewProps {
  onNavigate: (screen: ScreenType) => void;
  onSubmitSuccess: (details: Record<string, string>) => Promise<void> | void;
}

type FormField = 'game' | 'accountLevel' | 'currentRank' | 'skinsCount' | 'server' | 'description' | 'price' | 'bankAccount';
type FieldErrors = Partial<Record<FormField, string>>;

export const SubmitAccountView: React.FC<SubmitAccountViewProps> = ({
  onNavigate,
  onSubmitSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Form states matching Wireframe Image 13
  const [formData, setFormData] = useState({
    game: 'Mobile Legends',
    accountLevel: '',
    currentRank: '',
    skinsCount: '',
    server: 'Asia',
    description: '',
    price: '',
    bankAccount: '',
  });

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const getStepErrors = (step: number): FieldErrors => {
    const errors: FieldErrors = {};
    if (step === 1) {
      const level = Number(formData.accountLevel);
      if (!/^\d+$/.test(formData.accountLevel) || !Number.isInteger(level) || level < 1 || level > 10000) {
        errors.accountLevel = 'Enter a whole number from 1 to 10,000.';
      }
      if (!formData.currentRank.trim() || formData.currentRank.trim().length > 80) {
        errors.currentRank = 'Enter a rank up to 80 characters.';
      }
      const skinsCount = Number(formData.skinsCount);
      if (!/^\d+$/.test(formData.skinsCount) || !Number.isInteger(skinsCount) || skinsCount > 10000) {
        errors.skinsCount = 'Enter a whole number from 0 to 10,000.';
      }
      if (!formData.server.trim() || formData.server.trim().length > 80) {
        errors.server = 'Enter a server or region up to 80 characters.';
      }
      if (!formData.description.trim() || formData.description.trim().length > 1500) {
        errors.description = 'Enter a description up to 1,500 characters.';
      }
    }
    if (step === 3) {
      const price = Number(formData.price);
      if (!/^\d+$/.test(formData.price) || !Number.isInteger(price) || price < 1 || price > 100000000) {
        errors.price = 'Enter a whole number price from Nu. 1 to Nu. 100,000,000.';
      }
      const bankAccount = formData.bankAccount.trim();
      const bankDigits = bankAccount.replace(/\D/g, '');
      if (bankAccount && (
        bankAccount.length > 40
        || !/^[\d\s+-]+$/.test(bankAccount)
        || bankDigits.length < 4
        || bankDigits.length > 34
      )) {
        errors.bankAccount = 'Enter a valid payout account number (4–34 digits), or leave it blank.';
      }
    }
    return errors;
  };

  const inputClass = (field: FormField) => (
    `w-full bg-[#0B131E] text-slate-200 border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none placeholder-slate-600 ${
      fieldErrors[field]
        ? 'border-red-500 focus:border-red-400'
        : 'border-[#1E3048] focus:border-[#00D2FF]'
    }`
  );

  const renderFieldError = (field: FormField) => fieldErrors[field] && (
    <p id={`${field}-error`} className="text-xs font-mono text-red-400" role="alert">
      {fieldErrors[field]}
    </p>
  );

  const handleContinue = async () => {
    if (currentStep < 4) {
      const errors = getStepErrors(currentStep);
      setFieldErrors(errors);
      if (Object.keys(errors).length) return;
      setCurrentStep(currentStep + 1);
    } else {
      const stepOneErrors = getStepErrors(1);
      const stepThreeErrors = getStepErrors(3);
      const errors = { ...stepOneErrors, ...stepThreeErrors };
      setFieldErrors(errors);
      if (Object.keys(errors).length) {
        setCurrentStep(Object.keys(stepOneErrors).length ? 1 : 3);
        return;
      }
      await onSubmitSuccess({
        game: formData.game,
        level: formData.accountLevel,
        rank: formData.currentRank,
        skinsCount: formData.skinsCount,
        server: formData.server,
        description: formData.description,
        price: formData.price,
        bankAccount: formData.bankAccount,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      
      {/* Top Back Button & Title matching Wireframe Image 13 */}
      <div className="space-y-4">
        <button
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              onNavigate('sell');
            }
          }}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-[#00D2FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep > 1 ? 'Previous Step' : 'Back to Sell Info'}</span>
        </button>

        <h1 className="text-3xl font-mono font-bold text-white tracking-tight">
          Submit Account
        </h1>

        {/* Step Indicator & Progress Bar matching Wireframe Image 13 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#00D2FF] font-bold">Step {currentStep} of 4</span>
            <span className="text-slate-400">
              {currentStep === 1 && 'Account Specifications'}
              {currentStep === 2 && 'Security & Login Binds'}
              {currentStep === 3 && 'Valuation & Payout'}
              {currentStep === 4 && 'Verification Summary'}
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-[#16253B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00D2FF] transition-all duration-300 shadow-[0_0_10px_rgba(0,210,255,0.5)]"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <SecurityNotice title="Protect your game account">
        Never submit game passwords, one-time codes, recovery keys, or login cookies. Only the last four digits of a payout account are retained with this listing.
      </SecurityNotice>

      {/* Form Card matching Wireframe Image 13 */}
      <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 md:p-8 space-y-6">
        
        {currentStep === 1 && (
          <div className="space-y-5">
            {/* Field: Game */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Game
              </label>
              <select
                value={formData.game}
                onChange={(e) => handleInputChange('game', e.target.value)}
                className={inputClass('game')}
                aria-invalid={Boolean(fieldErrors.game)}
                aria-describedby={fieldErrors.game ? 'game-error' : undefined}
              >
                <option value="Mobile Legends">Mobile Legends (MLBB)</option>
                <option value="eFootball">eFootball (PES)</option>
                <option value="PUBG Mobile">PUBG Mobile</option>
                <option value="Free Fire">Free Fire</option>
                <option value="Valorant">Valorant</option>
              </select>
              {renderFieldError('game')}
            </div>

            {/* Field: Account Level */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Account Level
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Select / enter account level (e.g. 80)"
                value={formData.accountLevel}
                onChange={(e) => handleInputChange('accountLevel', e.target.value)}
                className={inputClass('accountLevel')}
                aria-invalid={Boolean(fieldErrors.accountLevel)}
                aria-describedby={fieldErrors.accountLevel ? 'accountLevel-error' : undefined}
              />
              {renderFieldError('accountLevel')}
            </div>

            {/* Field: Current Rank */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Current Rank
              </label>
              <input
                type="text"
                placeholder="Select / enter current rank (e.g. Mythical Glory)"
                value={formData.currentRank}
                onChange={(e) => handleInputChange('currentRank', e.target.value)}
                className={inputClass('currentRank')}
                aria-invalid={Boolean(fieldErrors.currentRank)}
                aria-describedby={fieldErrors.currentRank ? 'currentRank-error' : undefined}
              />
              {renderFieldError('currentRank')}
            </div>

            {/* Field: Number of Skins */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Number of Skins
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Select / enter number of skins (e.g. 215)"
                value={formData.skinsCount}
                onChange={(e) => handleInputChange('skinsCount', e.target.value)}
                className={inputClass('skinsCount')}
                aria-invalid={Boolean(fieldErrors.skinsCount)}
                aria-describedby={fieldErrors.skinsCount ? 'skinsCount-error' : undefined}
              />
              {renderFieldError('skinsCount')}
            </div>

            {/* Field: Server / Region */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Server / Region
              </label>
              <input
                type="text"
                placeholder="Select / enter server / region (e.g. Asia)"
                value={formData.server}
                onChange={(e) => handleInputChange('server', e.target.value)}
                className={inputClass('server')}
                aria-invalid={Boolean(fieldErrors.server)}
                aria-describedby={fieldErrors.server ? 'server-error' : undefined}
              />
              {renderFieldError('server')}
            </div>

            {/* Field: Description */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Short Description of account features, hero pool, and skins..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`${inputClass('description')} resize-none`}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={fieldErrors.description ? 'description-error' : undefined}
              />
              {renderFieldError('description')}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5 font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase">Security & Login Details</h3>
            <p className="text-slate-400 text-[11px]">
              Do not enter sensitive passwords yet. Verification team will contact you once the listing is approved.
            </p>

            <div className="space-y-2">
              <label className="text-slate-300 block font-semibold">Primary Login Method</label>
              <select className="w-full bg-[#0B131E] text-slate-200 border border-[#1E3048] rounded-xl px-4 py-3">
                <option>Moonton Account (Email clean & changeable)</option>
                <option>Google Play ID</option>
                <option>Facebook Unbind ready</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-2">
              <div className="flex items-center gap-2 text-[#00D2FF]">
                <Shield className="w-4 h-4" />
                <span className="font-bold">Bhutan Verification Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Accounts with two-factor binds must be prepared for transfer within 24 hours of purchase.
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase">Payout & Valuation</h3>
            
            <div className="space-y-2">
              <label className="text-slate-300 block font-semibold">Desired Selling Price (Nu.)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`${inputClass('price')} text-base text-[#00D2FF] font-bold`}
                aria-invalid={Boolean(fieldErrors.price)}
                aria-describedby={fieldErrors.price ? 'price-error' : undefined}
              />
              {renderFieldError('price')}
              <span className="text-[10px] text-slate-500">
                Recommended valuation for this tier: Nu. 6,500 - Nu. 7,500
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 block font-semibold">Bhutan Bank Account / mBOB Number</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                className={inputClass('bankAccount')}
                aria-invalid={Boolean(fieldErrors.bankAccount)}
                aria-describedby={fieldErrors.bankAccount ? 'bankAccount-error' : undefined}
              />
              {renderFieldError('bankAccount')}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase">Review Your Submission</h3>
            
            <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Game:</span>
                <strong className="text-white">{formData.game}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Level & Rank:</span>
                <strong className="text-white">Lvl.{formData.accountLevel} · {formData.currentRank}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Skins & Server:</span>
                <strong className="text-white">{formData.skinsCount} Skins · {formData.server}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Listed Price:</span>
                <strong className="text-[#00D2FF]">Nu. {Number(formData.price || 0).toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#10B981]">
              <Check className="w-4 h-4 shrink-0" />
              <span>Ready for DrukGG compliance team inspection</span>
            </div>
          </div>
        )}

        {/* Continue Button matching Wireframe Image 13 (Cyan button) */}
        <div className="pt-4">
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)]"
          >
            {currentStep === 4 ? 'Submit Account' : 'Continue'}
          </button>
        </div>

      </div>

    </div>
  );
};
