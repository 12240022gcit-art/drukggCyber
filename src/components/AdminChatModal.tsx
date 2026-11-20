import React, { useState } from 'react';
import { AdminNotification, AdminChatMessage } from '../models/marketplace';
import { 
  X, 
  ShieldCheck, 
  Send, 
  Paperclip, 
  Bell, 
  MessageSquare, 
  CheckCheck, 
  Check,
  Building2,
} from 'lucide-react';

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdminNotification[];
  messages: AdminChatMessage[];
  onSendMessage: (text: string) => void;
  onMarkNotificationsRead: () => void;
}

export const AdminChatModal: React.FC<AdminChatModalProps> = ({
  isOpen,
  onClose,
  notifications,
  messages,
  onSendMessage,
  onMarkNotificationsRead,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'notifications'>('chat');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText);
    setInputText('');

    // Simulate Admin instant wireframe response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B131E] border border-[#1E3048] rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(0,210,255,0.15)] overflow-hidden flex flex-col h-[620px] max-h-[90vh]">
        
        {/* Header with admin access badge */}
        <div className="px-6 py-4 border-b border-[#1E3048] bg-[#111C2B] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00D2FF] to-[#3B82F6] flex items-center justify-center text-[#070C12] font-black font-mono shadow-md">
                <ShieldCheck className="w-6 h-6 text-[#070C12]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#10B981] border-2 border-[#111C2B] rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-white text-base">
                  DrukGG Admin Desk
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Admin account
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Role-restricted support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#16253B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Tabs: 1) Admin Chat (Talk Back) & 2) Admin Notifications */}
        <div className="px-6 py-2 bg-[#0E1724] border-b border-[#1E3048] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-[#00D2FF] text-[#070C12] shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#16253B]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Talk to Admin</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('notifications');
                onMarkNotificationsRead();
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'notifications'
                  ? 'bg-[#00D2FF] text-[#070C12] shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#16253B]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Admin Alerts</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#EF4444] text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <span className="hidden sm:inline text-[11px] text-slate-500">
            Escrow Ref: <strong className="text-slate-300">#ESCROW-THP-8023</strong>
          </span>
        </div>

        {/* Content Area */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#070C12]">
            
            {/* Conversation Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
              
              {/* Notice Banner */}
              <div className="p-3 rounded-xl bg-[#111C2B] border border-[#1E3048] text-center space-y-1">
                <span className="text-[10px] text-[#00D2FF] font-bold uppercase tracking-wider block">
                  🛡️ Official DrukGG Support Channel
                </span>
                <p className="text-[11px] text-slate-400">
                  Messages here are directly between you and the DrukGG Admin verification department in Bhutan.
                </p>
              </div>

              {messages.map((msg) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    {isAdmin && (
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="font-bold text-[#00D2FF] text-[11px]">
                          {msg.adminName || 'DrukGG Admin'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {msg.adminRole || 'Verification Officer'}
                        </span>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow-md ${
                        isAdmin
                          ? 'bg-[#111C2B] text-slate-100 border border-[#1E3048] rounded-tl-sm'
                          : 'bg-[#00D2FF] text-[#070C12] font-medium rounded-tr-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div
                        className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                          isAdmin ? 'text-slate-500' : 'text-[#070C12]/70 font-semibold'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {!isAdmin && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic p-1">
                  <div className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse"></div>
                  <span>Admin Tshering is typing...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-1.5 bg-[#0B131E] border-t border-[#1E3048] flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
              <span className="text-slate-500 shrink-0">Quick reply:</span>
              <button
                onClick={() => setInputText('Email unbind code has been generated and ready.')}
                className="px-2.5 py-1 rounded bg-[#111C2B] text-slate-300 hover:text-[#00D2FF] border border-[#1E3048] shrink-0"
              >
                "Email unbind ready"
              </button>
              <button
                onClick={() => setInputText('Please release the Nu. 7,000 to my mBOB account.')}
                className="px-2.5 py-1 rounded bg-[#111C2B] text-slate-300 hover:text-[#00D2FF] border border-[#1E3048] shrink-0"
              >
                "Release payout to mBOB"
              </button>
              <button
                onClick={() => setInputText('Attached screenshot of clean Moonton account binds.')}
                className="px-2.5 py-1 rounded bg-[#111C2B] text-slate-300 hover:text-[#00D2FF] border border-[#1E3048] shrink-0"
              >
                "Attached proof"
              </button>
            </div>

            {/* Input Bar (User talks back to admin) */}
            <form onSubmit={handleSend} className="p-3.5 bg-[#0B131E] border-t border-[#1E3048] flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Screenshot upload wireframe: upload detachment proof image.')}
                className="p-2.5 rounded-xl bg-[#111C2B] text-slate-400 hover:text-slate-200 border border-[#1E3048] transition-colors"
                title="Attach proof / screenshots"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your response to DrukGG Admin..."
                className="flex-1 bg-[#111C2B] text-slate-100 border border-[#1E3048] rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00D2FF] placeholder-slate-600"
              />

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        ) : (
          /* Notifications Tab */
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#070C12]">
            <div className="flex items-center justify-between border-b border-[#1E3048] pb-3 text-xs font-mono">
              <span className="text-slate-300 font-bold">Admin Notifications & Audit Log</span>
              <span className="text-slate-500">3 Notifications</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all ${
                    notif.unread
                      ? 'bg-[#111C2B] border-[#00D2FF]/50 shadow-md'
                      : 'bg-[#0B131E] border-[#1E3048] opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {notif.type === 'approval' && (
                        <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      {notif.type === 'escrow' && (
                        <div className="w-7 h-7 rounded-lg bg-[#00D2FF]/20 text-[#00D2FF] flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                      )}
                      {notif.type === 'security' && (
                        <div className="w-7 h-7 rounded-lg bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      )}
                      <h4 className="font-bold text-white text-sm">
                        {notif.title}
                      </h4>
                    </div>

                    <span className="text-[10px] text-slate-500 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 pl-9 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-3 pl-9 flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="text-[11px] text-[#00D2FF] hover:underline font-bold flex items-center gap-1"
                    >
                      <span>Reply to Admin</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
