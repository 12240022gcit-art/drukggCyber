import React, { useState } from 'react';
import { ScreenType } from '../models/marketplace';
import { ArrowLeft } from 'lucide-react';

interface SignUpViewProps {
  onNavigate: (screen: ScreenType) => void;
  onRegister: (details: { name: string; email: string; password: string }) => Promise<void>;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onNavigate, onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setErrorMessage('');
    try {
      await onRegister({ name, email, password });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-7">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#00D2FF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Header matching Wireframe Image 11 */}
      <div className="text-center space-y-2">
        {/* Chunky Stylized Sign Up Logo Text */}
        <div className="font-['Rajdhani',sans-serif] font-black text-5xl tracking-wide text-[#38BDF8] drop-shadow-[0_4px_12px_rgba(56,189,248,0.4)] uppercase">
          Sign Up
        </div>

        <h1 className="text-2xl font-mono font-bold text-white">
          Welcome
        </h1>
        <p className="text-xs font-mono text-slate-400">
          Sign up to continue to DrukGG
        </p>
      </div>

      {/* Form matching Wireframe Image 11 */}
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {errorMessage && <p role="alert" className="text-red-400">{errorMessage}</p>}
        
        {/* Field: Name */}
        <div className="space-y-1.5">
          <label className="text-slate-400 block font-semibold">Name</label>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name (as per Bhutan CID)"
            className="w-full bg-[#111C2B] text-slate-100 border border-[#1E3048] rounded-xl px-4 py-3.5 focus:border-[#00D2FF] focus:outline-none placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Field: Email */}
        <div className="space-y-1.5">
          <label className="text-slate-400 block font-semibold">Email</label>
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

        {/* Field: Password */}
        <div className="space-y-1.5">
          <label className="text-slate-400 block font-semibold">Password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
            className="w-full bg-[#111C2B] text-slate-100 border border-[#1E3048] rounded-xl px-4 py-3.5 focus:border-[#00D2FF] focus:outline-none placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Field: Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-slate-400 block font-semibold">Confirm your password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full bg-[#111C2B] text-slate-100 border border-[#1E3048] rounded-xl px-4 py-3.5 focus:border-[#00D2FF] focus:outline-none placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Sign Up Button matching Wireframe Image 11 (Cyan button) */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] mt-3"
        >
          Sign Up
        </button>

        {/* Already have an account? Sign in matching Wireframe Image 11 */}
        <div className="text-center pt-3 text-xs font-mono text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('signin')}
            className="text-[#00D2FF] font-semibold hover:underline ml-1"
          >
            Sign in
          </button>
        </div>

      </form>

    </div>
  );
};
