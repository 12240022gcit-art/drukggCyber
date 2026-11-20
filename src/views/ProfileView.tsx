import React, { useEffect, useState } from 'react';
import { ScreenType, MyListingItem } from '../models/marketplace';
import { getProfileData } from '../models/profileModel';
import { 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  LogOut, 
  User, 
  Package, 
  ListFilter, 
  Star, 
  Headphones, 
  ShieldCheck, 
  Settings,
} from 'lucide-react';

interface ProfileViewProps {
  user: { name: string; email: string };
  onLogout: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onNavigate }) => {
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    initials: user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    ordersCount: 0,
    listingsCount: 0,
    reviewsCount: 0,
    phone: '',
    bankName: '',
    accountNumber: '',
  });
  const [listings, setListings] = useState<MyListingItem[]>([]);
  const [profileError, setProfileError] = useState('');
  const [activeSection, setActiveSection] = useState<
    'details' | 'submissions' | 'reviews' | 'support' | 'safety' | 'settings'
  >('details');

  useEffect(() => {
    getProfileData().then(([profileResult, listingResult]) => {
      setProfile((previous) => ({ ...previous, ...profileResult.user }));
      setListings(listingResult.listings);
    }).catch((error) => setProfileError(error.message));
  }, []);

  const menuItems = [
    { id: 'details', label: 'Personal Details', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package, isNavigation: true },
    { id: 'submissions', label: 'My Submissions', icon: ListFilter },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'safety', label: 'Safety Center', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {profileError && <p role="alert" className="text-sm text-red-400">{profileError}</p>}
      
      {/* Top Back Button & Title matching Wireframe Image 8 */}
      <div className="flex items-center justify-between border-b border-[#1E3048] pb-4">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-[#00D2FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-mono text-slate-400">
          Account Status: <strong className="text-[#10B981]">Active</strong>
        </span>
      </div>

      <h1 className="text-3xl font-mono font-bold text-white tracking-tight">
        Profile
      </h1>

      {/* Desktop Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar, Stats & Navigation (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* User Profile Header Card matching Wireframe Image 8 */}
          <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 text-center space-y-4">
            
            {/* Purple Circular DG Avatar matching Wireframe Image 8 */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-mono font-bold text-3xl shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                {profile.initials}
              </div>
            </div>

            {/* Name & Verified User badge matching Wireframe Image 8 */}
            <div className="space-y-1">
              <h2 className="text-2xl font-mono font-bold text-white">
                {profile.name}
              </h2>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#10B981] font-semibold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Account Registered</span>
              </div>
            </div>

            {/* Stats Box matching Wireframe Image 8: 12 Orders | 3 Listings | 24 Reviews */}
            <div className="grid grid-cols-3 gap-2 bg-[#0B131E] rounded-xl p-3 border border-[#1E3048] text-center font-mono">
              <div className="space-y-0.5">
                <div className="text-lg font-bold text-white">{profile.ordersCount}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Orders</div>
              </div>
              <div className="space-y-0.5 border-x border-[#1E3048]">
                <div className="text-lg font-bold text-white">{profile.listingsCount}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Listings</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-lg font-bold text-white">{profile.reviewsCount}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Reviews</div>
              </div>
            </div>

          </div>

          {/* Nav List Items matching Wireframe Image 8 */}
          <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] overflow-hidden divide-y divide-[#1E3048] font-mono text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'orders') {
                      onNavigate('orders');
                    } else if (item.id === 'submissions') {
                      onNavigate('listings');
                    } else {
                      setActiveSection(item.id as any);
                    }
                  }}
                  className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#16253B] text-[#00D2FF] font-semibold'
                      : 'text-slate-200 hover:bg-[#16253B]/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D2FF]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              );
            })}
          </div>

          {/* Log Out Button matching Wireframe Image 8 (Red outline box) */}
          <button
            onClick={onLogout}
            className="w-full py-3.5 rounded-xl border border-red-500/50 hover:border-red-500 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

        </div>

        {/* Right Column: Active Section Details (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          
          {activeSection === 'details' && (
            <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 space-y-6">
              <div className="border-b border-[#1E3048] pb-4">
                <h3 className="font-mono font-bold text-white text-lg">
                  Personal Details & Verification
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Identity verification is not currently integrated.
                </p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-1">
                  <span className="text-slate-400">Full Name</span>
                  <p className="text-white font-semibold text-sm">{profile.name}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-1">
                  <span className="text-slate-400">Registered Phone</span>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold text-sm">{profile.phone || 'Not provided'}</p>
                    <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                      Not verified
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-1">
                  <span className="text-slate-400">Email Address</span>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold text-sm">{profile.email}</p>
                    <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                      Not verified
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-1">
                  <span className="text-slate-400">Linked Bank (mBOB Escrow Payouts)</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">{profile.bankName || 'Not provided'}</p>
                      <p className="text-[#00D2FF] text-xs">A/C: {profile.accountNumber || 'Not provided'}</p>
                    </div>
                    <span className="text-[10px] text-[#00D2FF] bg-[#00D2FF]/10 px-2 py-0.5 rounded border border-[#00D2FF]/20">
                      Primary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'submissions' && (
            <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 space-y-4 font-mono text-xs">
              <h3 className="font-bold text-white text-lg">My Submissions</h3>
              {listings.length === 0 ? (
                <p className="text-slate-400">You haven’t submitted any accounts yet.</p>
              ) : listings.map((listing) => (
                <div key={listing.id} className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white">{listing.title}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Listed for Nu. {listing.price.toLocaleString()} · {listing.rank}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold text-[11px]">
                    {listing.status === 'Active' ? 'Active on Marketplace' : listing.status}
                  </span>
                </div>
              ))}
              <button
                onClick={() => onNavigate('submit-account')}
                className="w-full py-3 rounded-xl bg-[#00D2FF] text-[#070C12] font-bold text-xs hover:bg-[#33DCFF]"
              >
                + Submit Another Account
              </button>
            </div>
          )}

          {activeSection === 'reviews' && (
            <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">Trader Feedback (24)</h3>
                <span className="text-[#00D2FF] font-bold text-sm">4.9 ★ Average</span>
              </div>
              <div className="space-y-3">
                {[
                  { user: 'Karma T.', text: 'Fast delivery! Received MLBB Moonton account within 10 minutes. Clean email unbind.', stars: 5 },
                  { user: 'Chimi W.', text: 'Legit seller in Thimphu. eFootball account had all promised epic players.', stars: 5 },
                  { user: 'Dorji P.', text: 'Great communication through DrukGG chat. Highly recommended.', stars: 5 },
                ].map((rev, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{rev.user}</span>
                      <span className="text-yellow-400">{'★'.repeat(rev.stars)}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 space-y-4 font-mono text-xs">
              <h3 className="font-bold text-white text-lg">DrukGG Local Support</h3>
              <p className="text-slate-300 leading-relaxed">
                Need help with order status, payment coordination, or account transfer?
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-1">
                  <span className="text-slate-400">WhatsApp Helpline</span>
                  <p className="text-[#00D2FF] font-bold">+975 17 48 92 10</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-1">
                  <span className="text-slate-400">Telegram Channel</span>
                  <p className="text-[#00D2FF] font-bold">@DrukGGEsports</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'safety' && (
            <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 space-y-4 font-mono text-xs">
              <h3 className="font-bold text-white text-lg">Safety & Anti-Scam Guidelines</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="p-3 rounded-lg bg-[#0B131E] border border-[#1E3048]">
                  🔒 Always transact through DrukGG Escrow. Never pay directly outside the platform.
                </li>
                <li className="p-3 rounded-lg bg-[#0B131E] border border-[#1E3048]">
                  🔑 Change recovery email and phone number immediately upon receiving credentials.
                </li>
                <li className="p-3 rounded-lg bg-[#0B131E] border border-[#1E3048]">
                  🛡️ Sellers must provide proof of ownership and clear unbind screenshots.
                </li>
              </ul>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-6 space-y-4 font-mono text-xs">
              <h3 className="font-bold text-white text-lg">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B131E] border border-[#1E3048]">
                  <span>SMS Order Notifications</span>
                  <span className="text-[#10B981] font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B131E] border border-[#1E3048]">
                  <span>Two-Factor Authentication (2FA)</span>
                  <span className="text-slate-400 font-bold">Not enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B131E] border border-[#1E3048]">
                  <span>Display Currency</span>
                  <span className="text-[#00D2FF] font-bold">Nu. (Bhutanese Ngultrum)</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
