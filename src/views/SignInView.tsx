import React, { useState } from 'react';
import { ScreenType } from '../models/marketplace';
import { ArrowLeft, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface SignInViewProps {
  onNavigate: (screen: ScreenType) => void;
  isAdminLogin?: boolean;
  onAuthenticate: (credentials: { email: string; password: string }, role: 'user' | 'admin') => Promise<void>;
}

export const SignInView: React.FC<SignInViewProps> = ({ 
  onNavigate, 
  isAdminLogin = false,
  onAuthenticate,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await onAuthenticate({ email, password }, isAdminLogin ? 'admin' : 'user');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sign in failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-8">
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#00D2FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

      </div>

      {/* Header matching Wireframe Image 10 */}
      <div className="text-center space-y-3">
        {/* Chunky Stylized Sign In Logo Text */}
        <div className="font-['Rajdhani',sans-serif] font-black text-5xl tracking-wide text-[#38BDF8] drop-shadow-[0_4px_12px_rgba(56,189,248,0.4)] uppercase">
          {isAdminLogin ? 'Admin Sign In' : 'Sign In'}
        </div>

        <h1 className="text-2xl font-mono font-bold text-white">
          {isAdminLogin ? 'Staff Operations Portal' : 'Welcome Back'}
        </h1>
        <p className="text-xs font-mono text-slate-400">
          {isAdminLogin
            ? 'Sign in to DrukGG Verification & Escrow Command Center'
            : 'Sign in to continue to DrukGG'}
        </p>

        {isAdminLogin && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Thimphu Operations · Level 3 Staff Authorization</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
        {errorMessage && <p role="alert" className="text-red-400">{errorMessage}</p>}
        
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-slate-400 block font-semibold">
            {isAdminLogin ? 'Staff Official Email' : 'Email'}
          </label>
          <div className="relative">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-[#111C2B] text-slate-100 border border-[#1E3048] rounded-xl px-4 py-3.5 focus:border-[#00D2FF] focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-slate-400 block font-semibold">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#111C2B] text-slate-100 border border-[#1E3048] rounded-xl px-4 py-3.5 focus:border-[#00D2FF] focus:outline-none placeholder-slate-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Forgot Password link */}
        {!isAdminLogin && <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setErrorMessage('Password reset is not configured yet. Please contact DrukGG support.')}
            className="text-xs font-mono text-[#00D2FF] hover:underline"
          >
            Forgot Password?
          </button>
        </div>}

        {/* Primary Sign In Button */}
        <button
          type="submit"
          className={`w-full py-4 rounded-xl font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] mt-2 ${
            isAdminLogin
              ? 'bg-[#F59E0B] text-[#070C12] hover:bg-[#FBBF24]'
              : 'bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF]'
          }`}
        >
          {isAdminLogin ? 'Enter Admin Dashboard' : 'Sign In'}
        </button>

        {/* Link to Sign Up */}
        <div className="text-center pt-3 text-xs font-mono text-slate-400">
          {!isAdminLogin ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="text-[#00D2FF] font-semibold hover:underline ml-1"
              >
                Sign up
              </button>
            </>
          ) : (
            <span>Authorized staff only</span>
          )}
        </div>

      </form>

    </div>
  );
};
