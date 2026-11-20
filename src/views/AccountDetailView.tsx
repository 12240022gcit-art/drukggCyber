import React, { useEffect, useState } from 'react';
import { ScreenType, GameAccount } from '../models/marketplace';
import { hasSession } from '../models/apiClient';
import { getAccountMessages, sendAccountMessage } from '../models/accountsModel';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  MessageSquare, 
  ShoppingBag, 
  Send,
  X
} from 'lucide-react';

interface AccountDetailViewProps {
  account: GameAccount;
  onNavigate: (screen: ScreenType) => void;
  onProceedToCheckout: (account: GameAccount) => void;
}

export const AccountDetailView: React.FC<AccountDetailViewProps> = ({
  account,
  onNavigate,
  onProceedToCheckout,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    if (!isChatOpen) return;
    getAccountMessages(account.id)
      .then(({ messages }) => setChatHistory(messages.map((message) => ({
        sender: message.sender === 'user' ? 'me' : 'seller',
        text: message.text,
      }))))
      .catch((error) => setChatError(error.message));
  }, [account.id, isChatOpen]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    if (!hasSession()) {
      setChatError('Sign in before messaging about an account.');
      return;
    }
    const text = chatMessage.trim();
    setChatMessage('');
    setChatError('');
    try {
      await sendAccountMessage(account.id, text);
      setChatHistory((previous) => [...previous, { sender: 'me', text }]);
    } catch (error) {
      setChatError(error.message);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-[#1E3048] pb-4">
        <button
          onClick={() => onNavigate('browse')}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-[#00D2FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Account ID: <strong className="text-slate-200">{account.id}</strong></span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Listed in Bhutan</span>
        </div>
      </div>

      {/* Main Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Media & Security (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Artwork */}
          <div className="rounded-2xl overflow-hidden border border-[#1E3048] bg-[#111C2B] relative shadow-2xl">
            <div className="h-96 w-full relative">
              <img
                src={account.image}
                alt={account.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B131E] via-transparent to-transparent opacity-80" />
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#070C12]/80 text-[#00D2FF] backdrop-blur-md border border-[#00D2FF]/40">
                  {account.game}
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#10B981]/80 text-white backdrop-blur-md flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Approved Listing
                </span>
              </div>
            </div>
          </div>

          {/* Seller Trust & Verification Card */}
          <div className="bg-[#111C2B] rounded-xl border border-[#1E3048] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-mono font-bold text-base shrink-0">
                DG
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-mono font-bold text-white text-sm">
                    {account.seller.name}
                  </h4>
                  <span className="text-[11px] font-mono text-[#10B981] flex items-center gap-1 font-semibold">
                    Seller account
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Review seller-provided details and ask questions before purchasing.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#16253B] text-slate-200 hover:text-white border border-[#1E3048] hover:border-[#00D2FF]/50 text-xs font-mono font-semibold transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span>Contact Seller</span>
            </button>
          </div>

          {/* Escrow Guarantee Box */}
          <div className="rounded-xl bg-[#070C12] border border-[#1E3048] p-5 space-y-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#00D2FF] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Payment and transfer process</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                This app does not process payments or hold funds in escrow.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Payment instructions are shared by support after you place an order.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Contact support if listed account details do not match what the seller provides.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Specs Table, Description & CTAs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Price matching Wireframe Image 3 */}
          <div className="space-y-3 bg-[#111C2B] rounded-xl border border-[#1E3048] p-6">
            <h1 className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
              {account.title}
            </h1>

            <p className="text-sm font-mono text-slate-300">
              {account.rank} <span className="text-slate-600">|</span> {account.skinsCount} Skins <span className="text-slate-600">|</span> Lv.{account.level}
            </p>

            <div className="pt-2 text-3xl font-mono font-extrabold text-[#00D2FF]">
              Nu. {account.price.toLocaleString()}
            </div>

            {/* Account Specs Table matching Wireframe Image 3 exactly */}
            <div className="pt-4 space-y-2">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Account Specifications
              </h3>
              
              <div className="rounded-lg border border-[#1E3048] overflow-hidden divide-y divide-[#1E3048] text-xs font-mono">
                <div className="grid grid-cols-2 bg-[#16253B]/50 px-4 py-2.5">
                  <span className="text-slate-400">Game</span>
                  <span className="text-slate-100 font-semibold">{account.specs.game}</span>
                </div>
                <div className="grid grid-cols-2 bg-[#111C2B] px-4 py-2.5">
                  <span className="text-slate-400">Level</span>
                  <span className="text-slate-100 font-semibold">{account.specs.level}</span>
                </div>
                <div className="grid grid-cols-2 bg-[#16253B]/50 px-4 py-2.5">
                  <span className="text-slate-400">Current Rank</span>
                  <span className="text-slate-100 font-semibold">{account.specs.currentRank}</span>
                </div>
                {account.specs.heroes && (
                  <div className="grid grid-cols-2 bg-[#111C2B] px-4 py-2.5">
                    <span className="text-slate-400">Heroes</span>
                    <span className="text-slate-100 font-semibold">{account.specs.heroes}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 bg-[#16253B]/50 px-4 py-2.5">
                  <span className="text-slate-400">Skins</span>
                  <span className="text-slate-100 font-semibold">{account.specs.skins}</span>
                </div>
                <div className="grid grid-cols-2 bg-[#111C2B] px-4 py-2.5">
                  <span className="text-slate-400">Server</span>
                  <span className="text-slate-100 font-semibold">{account.specs.server}</span>
                </div>
              </div>
            </div>

            {/* Description matching wireframe Image 3 */}
            <div className="pt-4 space-y-2">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Description
              </h3>
              <p className="text-xs font-mono text-slate-300 leading-relaxed bg-[#0B131E] p-4 rounded-lg border border-[#1E3048]">
                {account.description}
              </p>
            </div>

            {/* Action Buttons matching wireframe Image 3 ("Chat" & "Buy Now") */}
            <div className="pt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full py-3.5 rounded-xl bg-[#111C2B] text-[#00D2FF] hover:bg-[#16253B] border border-[#00D2FF]/40 font-mono text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => onProceedToCheckout(account)}
                className="w-full py-3.5 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-sm font-bold transition-all shadow-[0_0_15px_rgba(0,210,255,0.4)] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Interactive Chat Modal with Seller */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111C2B] border border-[#1E3048] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E3048] flex items-center justify-between bg-[#0B131E]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-mono font-bold text-xs">
                  DG
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-white">Chat with {account.seller.name}</h4>
                  <span className="text-[10px] font-mono text-[#10B981]">● Online (Thimphu, Bhutan)</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#16253B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 font-mono text-xs">
              {chatError && <p role="alert" className="text-red-400">{chatError}</p>}
              {chatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex ${item.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                      item.sender === 'me'
                        ? 'bg-[#00D2FF] text-[#070C12] font-semibold'
                        : 'bg-[#16253B] text-slate-200 border border-[#1E3048]'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#1E3048] bg-[#0B131E] flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask seller about email bind, transfer time..."
                className="flex-1 bg-[#111C2B] text-slate-200 border border-[#1E3048] rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00D2FF]"
              />
              <button
                onClick={handleSendMessage}
                className="p-2.5 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
