import React from 'react';
import { ScreenType, GameAccount } from '../models/marketplace';
import { BANNER_IMAGE, POPULAR_GAMES } from '../models/catalogPresentation';
import { Search, ArrowRight, Sparkles, Check, ChevronRight } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (screen: ScreenType) => void;
  onSelectAccount: (account: GameAccount) => void;
  onSelectGameFilter: (gameKey: string) => void;
  accounts: GameAccount[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectAccount,
  onSelectGameFilter,
  accounts,
  searchQuery,
  onSearchChange,
}) => {
  const featuredAccount = accounts[0];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Headline & Search Zone */}
      <section className="relative pt-6">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111C2B] border border-[#1E3048] text-xs font-mono text-[#00D2FF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gaming account marketplace for Bhutan</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-['Rajdhani',sans-serif] font-bold text-white tracking-tight uppercase">
            Find your next <span className="text-[#00D2FF]">gaming account</span>
          </h1>

          <p className="text-base text-slate-400 font-mono">
            Browse listings and review the details before you buy.
          </p>

          {/* Desktop Big Search Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-[#111C2B] rounded-xl border border-[#1E3048] focus-within:border-[#00D2FF] shadow-xl p-1.5 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search games, accounts, skins, ranks..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigate('browse');
                }}
              />
              <button
                onClick={() => onNavigate('browse')}
                className="px-5 py-2.5 rounded-lg bg-[#00D2FF] text-[#070C12] font-mono text-xs font-bold hover:bg-[#33DCFF] transition-colors shrink-0"
              >
                Browse Now
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs font-mono">
              <span className="text-slate-500">Popular:</span>
              {['MLBB', 'eFootball', 'PUBG', 'Free Fire'].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    onSelectGameFilter(g.toLowerCase());
                    onNavigate('browse');
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#111C2B] border border-[#1E3048] text-slate-300 hover:text-[#00D2FF] hover:border-[#00D2FF]/40 transition-colors"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Banner: "PLAY MORE FOR A BRIGHTER TOMORROW" (Dzong mountain visual) */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1E3048] bg-[#111C2B] shadow-2xl group">
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            src={BANNER_IMAGE}
            alt="Bhutan Dzong Mountain Gaming Visual"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070C12]/95 via-[#070C12]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B131E] via-transparent to-transparent" />

          {/* Banner Typography matching Mobile Wireframe */}
          <div className="absolute inset-y-0 left-0 p-8 md:p-12 flex flex-col justify-center max-w-xl">
            <span className="text-xs font-mono font-semibold text-[#00D2FF] tracking-widest uppercase mb-1">
              Esports Excellence · Bhutan
            </span>
            <h2 className="text-2xl md:text-4xl font-['Rajdhani',sans-serif] font-black text-white uppercase tracking-tight leading-tight">
              PLAY MORE <br />
              <span className="text-[#FBBF24]">FOR A BRIGHTER</span> <br />
              TOMORROW
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-mono mt-2 mb-4 leading-relaxed">
              A marketplace for Bhutanese gamers, with account submissions reviewed before listing and payment status tracked.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('browse')}
                className="px-5 py-2.5 rounded-lg bg-[#00D2FF] text-[#070C12] font-mono text-xs font-bold hover:bg-[#33DCFF] transition-all flex items-center gap-2"
              >
                <span>Explore Accounts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('sell')}
                className="px-4 py-2.5 rounded-lg bg-[#111C2B]/80 hover:bg-[#162335] text-white border border-[#1E3048] font-mono text-xs font-semibold transition-colors"
              >
                Sell Your Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-['Rajdhani',sans-serif] font-bold text-white uppercase tracking-wide">
              Popular Games
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Choose your competitive title to see available accounts
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-mono text-[#00D2FF] hover:underline flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {POPULAR_GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                onSelectGameFilter(game.shortName.toLowerCase());
                onNavigate('browse');
              }}
              className="p-4 rounded-xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF]/60 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group flex flex-col items-center text-center"
            >
              <div className="w-full h-14 rounded-xl bg-[#16253B] overflow-hidden mb-3 border border-[#1E3048]">
                {game.image ? (
                  <img
                    src={game.image}
                    alt={`${game.name} artwork`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="h-full flex items-center justify-center text-2xl" aria-hidden="true">
                    {game.icon}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-100 group-hover:text-[#00D2FF] transition-colors">
                {game.name}
              </span>
              <span className="text-xs font-mono text-slate-400 mt-1">
                {accounts.filter((account) => account.gameKey === game.id).length} Accounts
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Accounts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-['Rajdhani',sans-serif] font-bold text-white uppercase tracking-wide">
              Featured Accounts
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Browse available accounts and compare their listed details
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-mono text-[#00D2FF] hover:underline flex items-center gap-1"
          >
            <span>See All ({accounts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Featured Hero Card (Representing wireframe Image 2 featured card) */}
        {featuredAccount && <div 
          onClick={() => {
            onSelectAccount(featuredAccount);
            onNavigate('detail');
          }}
          className="p-5 rounded-xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF] cursor-pointer transition-all hover:shadow-xl group flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-full md:w-60 h-44 rounded-lg overflow-hidden relative shrink-0 border border-[#1E3048]">
            <img
              src={featuredAccount.image}
              alt={featuredAccount.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#070C12]/80 text-[#00D2FF] backdrop-blur-sm border border-[#00D2FF]/30">
              FEATURED
            </span>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xl font-mono font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                {featuredAccount.title}
              </h4>
              <div className="text-xl font-mono font-bold text-[#00D2FF]">
                Nu. {featuredAccount.price.toLocaleString()}
              </div>
            </div>

            <p className="text-sm font-mono text-slate-300">
              {featuredAccount.rank} <span className="text-slate-600">|</span> {featuredAccount.skinsCount} Skins <span className="text-slate-600">|</span> Lvl.{featuredAccount.level}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-mono font-semibold">
                <Check className="w-3.5 h-3.5" />
                Active listing
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Seller: <strong className="text-slate-200">{featuredAccount.seller.name}</strong>
              </span>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 font-mono">
              {featuredAccount.description}
            </p>
          </div>

          <div className="shrink-0 flex md:flex-col gap-2 w-full md:w-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectAccount(featuredAccount);
                onNavigate('checkout');
              }}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-[#00D2FF] text-[#070C12] font-mono text-xs font-bold hover:bg-[#33DCFF] transition-all"
            >
              Buy Now
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectAccount(featuredAccount);
                onNavigate('detail');
              }}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-[#16253B] text-slate-200 hover:text-white border border-[#1E3048] font-mono text-xs font-semibold transition-all"
            >
              View Specs
            </button>
          </div>
        </div>}

        {/* 3-Column Grid for More Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {accounts.slice(1, 4).map((acc) => (
            <div
              key={acc.id}
              onClick={() => {
                onSelectAccount(acc);
                onNavigate('detail');
              }}
              className="rounded-xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF] cursor-pointer transition-all hover:shadow-xl group overflow-hidden flex flex-col"
            >
              <div className="h-44 w-full relative overflow-hidden">
                <img
                  src={acc.image}
                  alt={acc.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#070C12]/80 text-white backdrop-blur-sm border border-[#1E3048]">
                    {acc.game}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h5 className="font-mono font-bold text-white text-base group-hover:text-[#00D2FF] transition-colors">
                    {acc.title}
                  </h5>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    {acc.rank} <span className="text-slate-600">|</span> Lvl.{acc.level}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#1E3048]">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[11px] font-mono font-semibold">
                    <Check className="w-3 h-3" />
                    Active listing
                  </span>
                  <span className="font-mono font-bold text-sm text-[#00D2FF]">
                    Nu. {acc.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Selling Proposition Teaser */}
      <section className="rounded-2xl bg-gradient-to-r from-[#111C2B] to-[#15253A] border border-[#1E3048] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-mono font-semibold text-[#00D2FF] uppercase tracking-wider">
            Got an unused gaming account?
          </span>
          <h3 className="text-2xl font-['Rajdhani',sans-serif] font-bold text-white uppercase">
            Submit your gaming account for review
          </h3>
          <p className="text-xs md:text-sm text-slate-300 font-mono leading-relaxed">
            Track listing status in your account. Payment arrangements are coordinated manually with DrukGG support.
          </p>
        </div>
        <button
          onClick={() => onNavigate('sell')}
          className="px-6 py-3 rounded-xl bg-[#00D2FF] text-[#070C12] font-mono text-sm font-bold hover:bg-[#33DCFF] transition-all whitespace-nowrap shadow-lg shrink-0"
        >
          Start Selling
        </button>
      </section>

    </div>
  );
};
