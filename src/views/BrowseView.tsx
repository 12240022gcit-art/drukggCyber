import React, { useState, useMemo } from 'react';
import { ScreenType, GameAccount } from '../models/marketplace';
import { Search, Check, SlidersHorizontal, ArrowUpDown, ChevronRight } from 'lucide-react';

interface BrowseViewProps {
  onNavigate: (screen: ScreenType) => void;
  onSelectAccount: (account: GameAccount) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGameFilter: string;
  onSelectGameFilter: (gameKey: string) => void;
  accounts: GameAccount[];
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  onNavigate,
  onSelectAccount,
  searchQuery,
  onSearchChange,
  selectedGameFilter,
  onSelectGameFilter,
  accounts,
}) => {
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'level'>('featured');

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'mlbb', label: 'Mlbb' },
    { id: 'efootball', label: 'eFootball' },
    { id: 'pubg', label: 'PUBG' },
    { id: 'freefire', label: 'Free Fire' },
  ];

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Game filter
      if (selectedGameFilter !== 'all' && acc.gameKey !== selectedGameFilter) {
        return false;
      }
      if (approvedOnly && !acc.isVerified) {
        return false;
      }
      // Max price
      if (acc.price > maxPrice) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          acc.title.toLowerCase().includes(query) ||
          acc.game.toLowerCase().includes(query) ||
          acc.rank.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'level') return b.level - a.level;
      return 0;
    });
  }, [accounts, selectedGameFilter, approvedOnly, maxPrice, searchQuery, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header & Search Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold text-white tracking-tight">
              Browse Accounts
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Browse marketplace listings. Payment and account transfer are coordinated manually with support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              <strong className="text-white font-bold text-sm">{accounts.length}</strong> Accounts Available
            </span>
          </div>
        </div>

        {/* Search bar matching wireframe */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search games, accounts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#111C2B] text-slate-200 placeholder-slate-500 font-mono text-sm rounded-xl pl-11 pr-4 py-3 border border-[#1E3048] focus:border-[#00D2FF] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Pills / Tabs matching wireframe Image 1: All, Mlbb, eFootball, PUPG */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filterTabs.map((tab) => {
              const isActive = selectedGameFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectGameFilter(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                    isActive
                      ? 'bg-[#00D2FF] text-[#070C12] shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                      : 'bg-[#111C2B] text-slate-300 hover:text-white border border-[#1E3048] hover:border-[#00D2FF]/40'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Sort Control */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#111C2B] text-slate-200 border border-[#1E3048] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#00D2FF]"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="level">Highest Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop 2-Column Layout (Filters Sidebar + Accounts Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111C2B] rounded-xl border border-[#1E3048] p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E3048] pb-3">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-white uppercase">
                <SlidersHorizontal className="w-4 h-4 text-[#00D2FF]" />
                <span>Filters</span>
              </div>
              <button
                onClick={() => {
                  onSelectGameFilter('all');
                  setApprovedOnly(false);
                  setMaxPrice(10000);
                }}
                className="text-[11px] font-mono text-[#00D2FF] hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Listing approval filter */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block">Listing status</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={approvedOnly}
                  onChange={(e) => setApprovedOnly(e.target.checked)}
                  className="rounded bg-[#16253B] border-[#1E3048] text-[#00D2FF] focus:ring-0 w-4 h-4"
                />
                <span>Approved Listings Only</span>
              </label>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-300">Max Budget</span>
                <span className="text-[#00D2FF] font-bold">Nu. {maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={10000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#00D2FF] bg-[#16253B]"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Nu. 2,000</span>
                <span>Nu. 10,000+</span>
              </div>
            </div>

            {/* Quick Game Categories */}
            <div className="space-y-2 pt-2 border-t border-[#1E3048]">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                Games
              </label>
              <div className="space-y-1.5 text-xs font-mono">
                {[
                  { id: 'all', name: 'All Games' },
                  { id: 'mlbb', name: 'Mobile Legends' },
                  { id: 'efootball', name: 'eFootball' },
                  { id: 'pubg', name: 'PUBG Mobile' },
                  { id: 'freefire', name: 'Free Fire' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectGameFilter(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      selectedGameFilter === item.id
                        ? 'bg-[#16253B] text-[#00D2FF] font-bold border border-[#00D2FF]/30'
                        : 'text-slate-300 hover:bg-[#16253B]/50'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({item.id === 'all' ? accounts.length : accounts.filter((account) => account.gameKey === item.id).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Safe Escrow Notice */}
            <div className="p-3 rounded-lg bg-[#070C12] border border-[#1E3048] text-[11px] font-mono text-slate-400 space-y-1">
              <span className="text-[#00D2FF] font-bold block">Manual payment process</span>
              <p>This app does not process payments or hold funds. Confirm payment instructions directly with DrukGG support.</p>
            </div>
          </div>
        </div>

        {/* Right Accounts Grid matching wireframe cards */}
        <div className="lg:col-span-3 space-y-6">
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-16 bg-[#111C2B] rounded-xl border border-[#1E3048] space-y-3">
              <p className="text-base font-mono text-slate-300">No accounts match your current filters.</p>
              <button
                onClick={() => {
                  onSelectGameFilter('all');
                  setMaxPrice(10000);
                  setApprovedOnly(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#00D2FF] text-[#070C12] font-mono text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => {
                    onSelectAccount(account);
                    onNavigate('detail');
                  }}
                  className="rounded-xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl overflow-hidden group flex flex-col"
                >
                  {/* Card Image Banner */}
                  <div className="h-44 w-full relative overflow-hidden bg-[#070C12]">
                    <img
                      src={account.image}
                      alt={account.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#070C12]/80 text-[#00D2FF] backdrop-blur-sm border border-[#00D2FF]/30">
                        {account.game}
                      </span>
                    </div>
                  </div>

                  {/* Card Content matching Wireframe */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-mono font-bold text-white text-base group-hover:text-[#00D2FF] transition-colors leading-tight">
                        {account.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        {account.rank} <span className="text-slate-600">|</span> Lvl.{account.level}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#1E3048]">
                      {/* Verified Badge */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 text-xs font-mono font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Active listing
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {account.server}
                        </span>
                      </div>

                      {/* Price matching Nu. 7,000 / Nu. 5,500 */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-base font-mono font-bold text-white">
                          Nu. <span className="text-[#00D2FF]">{account.price.toLocaleString()}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#00D2FF] group-hover:underline flex items-center">
                          View <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
