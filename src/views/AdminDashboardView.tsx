import React, { useState } from 'react';
import { ScreenType, ListingSubmission } from '../models/marketplace';
import { downloadTextFile } from '../models/apiClient';
import { useAdminDashboardController } from '../controllers/useAdminDashboardController';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  MessageSquare, 
  Send, 
  Building2, 
  Clock, 
  Eye, 
  Search, 
  LogOut, 
  Store, 
  CheckCircle2, 
  Paperclip,
  Tag,
  PackageCheck
} from 'lucide-react';

interface AdminDashboardViewProps {
  onNavigate: (screen: ScreenType) => void;
  onLogoutAdmin: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
  onLogoutAdmin,
}) => {
  const {
    submissions,
    liveAccounts,
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    replyText,
    setReplyText,
    escrows,
    pageError,
    setPageError,
    handleApproveSubmission,
    handleRejectSubmission,
    handleDeleteSubmission,
    handleDeleteLiveListing,
    handleSendAdminReply: sendAdminReply,
    handleReleasePayout,
    handleConfirmFundsReceived,
  } = useAdminDashboardController();

  // Navigation tabs in Admin
  const [activeTab, setActiveTab] = useState<'submissions' | 'messages' | 'listings' | 'escrow'>('submissions');
  
  // Submissions state
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectModalSubmission, setRejectModalSubmission] = useState<ListingSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState('2FA recovery phone or email still bound to account');
  const [inspectModalSubmission, setInspectModalSubmission] = useState<ListingSubmission | null>(null);

  const [listingSearch, setListingSearch] = useState('');

  const activeConversation = conversations.find((c) => c.id === selectedConversationId) || conversations[0] || {
    id: '',
    userId: '',
    userName: 'No support messages yet',
    userInitials: '--',
    userPhone: '',
    activeContext: 'DrukGG Support',
    lastMessage: '',
    lastMessageTime: '',
    unreadCount: 0,
    messages: [],
  };

  const handleOpenRejectModal = (sub: ListingSubmission) => {
    setRejectModalSubmission(sub);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalSubmission) return;
    if (await handleRejectSubmission(rejectModalSubmission.id, rejectReason)) {
      setRejectModalSubmission(null);
    }
  };

  const confirmDeleteSubmission = async (subId: string) => {
    if (confirm('Are you sure you want to permanently delete this listing submission?')) {
      await handleDeleteSubmission(subId);
    }
  };

  const confirmDeleteLiveListing = async (accId: string, title: string) => {
    if (confirm(`Admin Action: Are you sure you want to delete and remove "${title}" from the live marketplace?`)) {
      await handleDeleteLiveListing(accId);
    }
  };

  const handleSendAdminReply = (event: React.FormEvent) => {
    event.preventDefault();
    void sendAdminReply(activeConversation.userId);
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'all') return true;
    return s.status === submissionFilter;
  });

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-8 pb-20">
      {pageError && <p role="alert" className="text-sm text-red-400">{pageError}</p>}
      
      {/* Admin Top Operations Bar */}
      <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D2FF] to-[#3B82F6] flex items-center justify-center text-[#070C12] font-black shadow-[0_0_20px_rgba(0,210,255,0.4)]">
            <ShieldCheck className="w-7 h-7 text-[#070C12]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-mono font-bold text-white tracking-tight">
                DrukGG Admin Command Center
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                Admin session
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Authenticated administrator · Role-restricted management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 rounded-xl bg-[#16253B] hover:bg-[#1C2F4A] text-slate-200 border border-[#1E3048] text-xs font-mono font-semibold transition-all flex items-center gap-2"
          >
            <Store className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>View User Storefront</span>
          </button>

          <button
            onClick={onLogoutAdmin}
            className="px-4 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/30 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setActiveTab('submissions')}
          className="p-5 rounded-2xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF]/50 cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Pending Submissions</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <p className="text-2xl font-mono font-bold text-amber-400">
            {pendingCount} Accounts
          </p>
          <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-300">
            Awaiting verification & listing approval
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('escrow')}
          className="p-5 rounded-2xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF]/50 cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Payment Status Tracking</span>
            <Building2 className="w-3.5 h-3.5 text-[#00D2FF]" />
          </div>
          <p className="text-2xl font-mono font-bold text-[#00D2FF]">
            Nu. {escrows.filter((transaction) => transaction.status === 'held_in_escrow').reduce((total, transaction) => total + transaction.amount, 0).toLocaleString()}
          </p>
          <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-300">
            Status updated manually; no funds are held in this app
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('messages')}
          className="p-5 rounded-2xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF]/50 cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>User Support Chats</span>
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-400">
            {conversations.length} Active Threads
          </p>
          <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-300">
            Give & receive messages in real-time
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('listings')}
          className="p-5 rounded-2xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF]/50 cursor-pointer transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Marketplace Inventory</span>
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-white">
            {liveAccounts.length} Active
          </p>
          <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-300">
            Active marketplace listings
          </span>
        </div>

      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E3048] pb-1 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'submissions'
              ? 'bg-[#00D2FF] text-[#070C12] shadow-[0_0_15px_rgba(0,210,255,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-[#111C2B]'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Seller Submissions</span>
          {pendingCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'submissions' ? 'bg-[#070C12] text-[#00D2FF]' : 'bg-amber-400 text-[#070C12]'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'messages'
              ? 'bg-[#00D2FF] text-[#070C12] shadow-[0_0_15px_rgba(0,210,255,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-[#111C2B]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>User Messages & Support</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#1E3048] text-slate-300">
            3
          </span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'listings'
              ? 'bg-[#00D2FF] text-[#070C12] shadow-[0_0_15px_rgba(0,210,255,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-[#111C2B]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Manage Live Listings</span>
        </button>

        <button
          onClick={() => setActiveTab('escrow')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'escrow'
              ? 'bg-[#00D2FF] text-[#070C12] shadow-[0_0_15px_rgba(0,210,255,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-[#111C2B]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Payment Status Tracking</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SELLER SUBMISSIONS (Approve, Disapprove, Delete, Inspect) */}
      {/* ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Sub-Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSubmissionFilter('pending')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  submissionFilter === 'pending'
                    ? 'bg-[#1E3048] text-[#00D2FF] border border-[#00D2FF]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                Pending Review ({submissions.filter((s) => s.status === 'pending').length})
              </button>
              <button
                onClick={() => setSubmissionFilter('approved')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  submissionFilter === 'approved'
                    ? 'bg-[#1E3048] text-[#10B981] border border-[#10B981]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                Approved ({submissions.filter((s) => s.status === 'approved').length})
              </button>
              <button
                onClick={() => setSubmissionFilter('rejected')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  submissionFilter === 'rejected'
                    ? 'bg-[#1E3048] text-red-400 border border-red-500/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                Disapproved ({submissions.filter((s) => s.status === 'rejected').length})
              </button>
              <button
                onClick={() => setSubmissionFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  submissionFilter === 'all'
                    ? 'bg-[#1E3048] text-white border border-slate-500'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                All Submissions ({submissions.length})
              </button>
            </div>

            <span className="text-slate-400 text-[11px]">
              SLA Guarantee: Review within 2 hours
            </span>
          </div>

          {/* Submissions List Table / Cards */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center bg-[#111C2B] rounded-2xl border border-[#1E3048] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                <p className="font-mono text-sm text-slate-300">No submissions under this filter.</p>
                <p className="font-mono text-xs text-slate-500">All seller accounts have been processed.</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-6 rounded-2xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF]/40 transition-all space-y-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Account Info */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#070C12] border border-[#1E3048] shrink-0 relative group">
                        <img
                          src={sub.image}
                          alt={sub.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setInspectModalSubmission(sub)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-mono"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-mono font-bold text-white text-base">
                            {sub.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#16253B] text-[#00D2FF] border border-[#00D2FF]/30 font-bold">
                            {sub.submissionCode}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0B131E] text-slate-300 border border-[#1E3048]">
                            {sub.game}
                          </span>
                        </div>

                        <p className="text-xs font-mono text-slate-300">
                          {sub.rank} <span className="text-slate-600">|</span> Lvl.{sub.level} <span className="text-slate-600">|</span> {sub.skinsCount} Skins <span className="text-slate-600">|</span> {sub.server}
                        </p>

                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-0.5">
                          <span>Seller: <strong className="text-slate-200">{sub.sellerName}</strong></span>
                          <span>·</span>
                          <span>CID: <strong className="text-slate-200">{sub.sellerCid || 'Not provided'}</strong></span>
                          <span>·</span>
                          <span>{sub.submittedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Payout Destination */}
                    <div className="text-left lg:text-right font-mono space-y-0.5">
                      <div className="text-xs text-slate-400">Requested Selling Price:</div>
                      <div className="text-2xl font-bold text-[#00D2FF]">
                        Nu. {sub.price.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Payout to: <span className="text-slate-200">{sub.sellerBank}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <div className="p-3.5 rounded-xl bg-[#0B131E] border border-[#1E3048] text-xs font-mono text-slate-300 flex items-start gap-2">
                    <span className="text-[#00D2FF] font-bold shrink-0">Seller Note:</span>
                    <p className="line-clamp-2">{sub.description}</p>
                  </div>

                  {/* Actions & Decision Controls */}
                  <div className="pt-2 border-t border-[#1E3048] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                    
                    {/* Status Label */}
                    <div>
                      {sub.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Admin Verification
                        </span>
                      )}
                      {sub.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Approved & Active On Marketplace
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
                          <X className="w-3.5 h-3.5" />
                          <span>Disapproved: {sub.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Approve, Disapprove, Delete, Message */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setInspectModalSubmission(sub)}
                        className="px-3 py-2 rounded-lg bg-[#16253B] text-slate-300 hover:text-white border border-[#1E3048] transition-colors"
                      >
                        Inspect Proof
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('messages');
                          setSelectedConversationId(sub.userId);
                        }}
                        className="px-3 py-2 rounded-lg bg-[#16253B] text-slate-300 hover:text-[#00D2FF] border border-[#1E3048] transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Seller</span>
                      </button>

                      {sub.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOpenRejectModal(sub)}
                            className="px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-950/70 text-red-400 border border-red-500/40 font-bold transition-all flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Disapprove</span>
                          </button>

                          <button
                            onClick={() => handleApproveSubmission(sub.id)}
                            className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#070C12] font-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Approve & List</span>
                          </button>
                        </>
                      )}

                      {/* Delete Listing Button */}
                      <button
                        onClick={() => confirmDeleteSubmission(sub.id)}
                        className="p-2 rounded-lg bg-[#111C2B] hover:bg-red-950/50 text-slate-500 hover:text-red-400 border border-[#1E3048] hover:border-red-500/40 transition-colors"
                        title="Delete this submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MESSAGES & SUPPORT DESK (Receive and Give Messages to Users) */}
      {/* ========================================================================= */}
      {activeTab === 'messages' && (
        <div className="bg-[#111C2B] rounded-2xl border border-[#1E3048] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] animate-in fade-in duration-200">
          
          {/* Left Column: Users / Threads List (4 cols) */}
          <div className="md:col-span-4 border-r border-[#1E3048] bg-[#0B131E] flex flex-col">
            <div className="p-4 border-b border-[#1E3048]">
              <h3 className="font-mono font-bold text-white text-sm">
                User Support Inquiries
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Two-way communication with sellers & buyers
              </p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#1E3048]/60 font-mono text-xs">
              {conversations.map((conv) => {
                const isSelected = conv.id === activeConversation.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#16253B] border-l-4 border-l-[#00D2FF]'
                        : 'hover:bg-[#111C2B]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {conv.userInitials}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{conv.userName}</h4>
                          <span className="text-[10px] text-slate-500">{conv.userPhone}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{conv.lastMessageTime}</span>
                    </div>

                    <div className="mt-2 text-[11px] text-[#00D2FF] font-semibold truncate">
                      {conv.activeContext}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Conversation (8 cols) - Give and receive messages */}
          <div className="md:col-span-8 flex flex-col bg-[#070C12]">
            
            {/* Thread Header */}
            <div className="p-4 border-b border-[#1E3048] bg-[#0B131E] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold font-mono text-sm">
                  {activeConversation.userInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-white text-sm">
                      {activeConversation.userName}
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Identity Check Not Configured
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#00D2FF]">
                    Context: {activeConversation.activeContext}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageError(`No CID verification integration is configured for ${activeConversation.userName}.`)}
                  className="px-3 py-1.5 rounded-lg bg-[#16253B] text-slate-300 hover:text-white border border-[#1E3048] text-xs font-mono"
                >
                  View User KYC
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
              {activeConversation.messages.map((msg) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="font-bold text-[11px] text-slate-300">
                        {isAdmin ? 'You (DrukGG Admin)' : activeConversation.userName}
                      </span>
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed shadow-md ${
                        isAdmin
                          ? 'bg-[#00D2FF] text-[#070C12] font-semibold rounded-tr-sm'
                          : 'bg-[#111C2B] text-slate-200 border border-[#1E3048] rounded-tl-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Admin Action Presets */}
            <div className="px-4 py-2 bg-[#0B131E] border-t border-[#1E3048] flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
              <span className="text-slate-500 shrink-0">Admin Macros:</span>
              <button
                onClick={() => setReplyText('Please unbind secondary recovery email and confirm here.')}
                className="px-2.5 py-1 rounded bg-[#111C2B] text-slate-300 hover:text-[#00D2FF] border border-[#1E3048] shrink-0"
              >
                "Request Email Unbind"
              </button>
              <button
                onClick={() => setReplyText('Please verify your payment with DrukGG support before account handover.')}
                className="px-2.5 py-1 rounded bg-[#111C2B] text-slate-300 hover:text-[#00D2FF] border border-[#1E3048] shrink-0"
              >
                "Confirm externally received payment"
              </button>
              <button
                onClick={() => setReplyText('Congratulations! Your listing has been approved and is live on DrukGG.')}
                className="px-2.5 py-1 rounded bg-[#111C2B] text-slate-300 hover:text-[#00D2FF] border border-[#1E3048] shrink-0"
              >
                "Listing Approved"
              </button>
            </div>

            {/* Admin Reply Input */}
            <form onSubmit={handleSendAdminReply} className="p-4 bg-[#0B131E] border-t border-[#1E3048] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageError('File attachments are not configured. Send text details in this support thread.')}
                className="p-2.5 rounded-xl bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]"
                title="Attach official template"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={!activeConversation.userId}
                placeholder={`Reply to ${activeConversation.userName} as DrukGG Verification Officer...`}
                className="flex-1 bg-[#111C2B] text-slate-100 border border-[#1E3048] rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00D2FF] placeholder-slate-600"
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span>Send to User</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MANAGE LIVE LISTINGS (Delete, Delist, Inspect public marketplace) */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <h2 className="text-xl font-bold text-white">Live Marketplace Accounts</h2>
              <p className="text-slate-400 text-xs">Delete or modify public gaming accounts on DrukGG</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder="Filter by title or game..."
                className="w-full bg-[#111C2B] text-slate-200 border border-[#1E3048] rounded-xl pl-9 pr-4 py-2 text-xs font-mono focus:border-[#00D2FF] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveAccounts
              .filter((acc) =>
                acc.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
                acc.game.toLowerCase().includes(listingSearch.toLowerCase())
              )
              .map((acc) => (
                <div
                  key={acc.id}
                  className="rounded-2xl bg-[#111C2B] border border-[#1E3048] overflow-hidden flex flex-col justify-between p-5 space-y-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="h-40 w-full rounded-xl overflow-hidden bg-[#070C12] border border-[#1E3048] relative">
                      <img
                        src={acc.image}
                        alt={acc.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#070C12]/80 text-[#00D2FF]">
                        {acc.game}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-mono font-bold text-white text-base">{acc.title}</h4>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {acc.rank} · Lvl.{acc.level} · {acc.skinsCount} Skins
                      </p>
                      <div className="text-base font-mono font-bold text-[#00D2FF] mt-2">
                        Nu. {acc.price.toLocaleString()}
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        Seller: {acc.seller.name} (★ {acc.seller.rating})
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1E3048] flex items-center justify-between gap-2 font-mono text-xs">
                    <span className="text-[#10B981] font-semibold text-[11px] flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Live
                    </span>

                    <button
                      onClick={() => confirmDeleteLiveListing(acc.id, acc.title)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-950/70 text-red-400 border border-red-500/40 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Listing</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Manual payment status tracking */}
      {/* ========================================================================= */}
      {activeTab === 'escrow' && (
        <div className="space-y-6 animate-in fade-in duration-200 font-mono text-xs">
          
          <div className="p-6 rounded-2xl bg-[#111C2B] border border-[#1E3048] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00D2FF]" />
                <h3 className="font-bold text-white text-base">Manual Payment Status Tracking</h3>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                No payment or escrow integration is configured. These controls record manual status updates only.
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Amount marked as held:</span>
              <div className="text-2xl font-bold text-[#00D2FF]">Nu. {escrows.filter((transaction) => transaction.status === 'held_in_escrow').reduce((total, transaction) => total + transaction.amount, 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-4">
            {escrows.map((tx) => (
              <div
                key={tx.id}
                className="p-6 rounded-2xl bg-[#111C2B] border border-[#1E3048] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{tx.orderNumber}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[#00D2FF] font-bold">{tx.accountTitle}</span>
                    </div>
                    <div className="text-slate-400 mt-1">
                      Buyer: <strong className="text-slate-200">{tx.buyerName}</strong> ➔ Seller: <strong className="text-slate-200">{tx.sellerName}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xl text-white">Nu. {tx.amount.toLocaleString()}</div>
                    <div className="text-slate-400 text-[11px]">Fee: Nu. {tx.platformFee} · Net Payout: Nu. {tx.sellerPayout}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E3048] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Ref: <code className="text-slate-200 bg-[#0B131E] px-2 py-0.5 rounded">{tx.bankRef}</code></span>
                    {tx.status === 'payment_pending' ? (
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                        Payment Confirmation Pending
                      </span>
                    ) : tx.status === 'held_in_escrow' ? (
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                        Marked as held (external)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                        Payout marked released
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {tx.status === 'payment_pending' ? (
                      <button
                        onClick={() => handleConfirmFundsReceived(tx.id)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#070C12] font-black transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Confirm Funds Received</span>
                      </button>
                    ) : tx.status === 'held_in_escrow' ? (
                      <>
                        <button
                          onClick={() => handleReleasePayout(tx.id)}
                          className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#070C12] font-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Mark Payout Released (Nu. {tx.sellerPayout})</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => downloadTextFile(`drukgg-${tx.orderNumber.replace('#', '')}-payout.txt`, `${tx.orderNumber} · ${tx.accountTitle}\nPayout status: ${tx.status}\nAmount: Nu. ${tx.sellerPayout}`)}
                        className="px-3 py-1.5 rounded-lg bg-[#16253B] text-slate-300 hover:text-white border border-[#1E3048]"
                      >
                        Download Payout Voucher
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* MODAL: Reject / Disapprove Submission */}
      {rejectModalSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111C2B] border border-[#1E3048] rounded-2xl w-full max-w-md p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1E3048] pb-3">
              <h3 className="font-bold text-white text-sm">
                Disapprove Submission ({rejectModalSubmission.submissionCode})
              </h3>
              <button
                onClick={() => setRejectModalSubmission(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              Please specify the reason for disapproval. The seller ({rejectModalSubmission.sellerName}) will be notified immediately.
            </p>

            <div className="space-y-2">
              <label className="text-slate-400 block font-semibold">Rejection Reason</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#0B131E] text-slate-200 border border-[#1E3048] rounded-xl px-4 py-3"
              >
                <option value="2FA recovery phone or email still bound to account">
                  2FA recovery phone or email still bound to account
                </option>
                <option value="Incomplete or unreadable ownership proof screenshot">
                  Incomplete or unreadable ownership proof screenshot
                </option>
                <option value="Discrepancy in skin count or account level">
                  Discrepancy in skin count or account level
                </option>
                <option value="Server region does not support Bhutan/Asia handover">
                  Server region does not support Bhutan/Asia handover
                </option>
                <option value="Requested valuation exceeds marketplace policy guidelines">
                  Requested valuation exceeds marketplace policy guidelines
                </option>
              </select>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => setRejectModalSubmission(null)}
                className="py-3 rounded-xl bg-[#16253B] text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Inspect Submission Full Proof */}
      {inspectModalSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111C2B] border border-[#1E3048] rounded-2xl w-full max-w-2xl p-6 space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E3048] pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  Inspection: {inspectModalSubmission.title} ({inspectModalSubmission.submissionCode})
                </h3>
                <span className="text-[11px] text-slate-400">Seller: {inspectModalSubmission.sellerName} · Phone: {inspectModalSubmission.sellerPhone}</span>
              </div>
              <button
                onClick={() => setInspectModalSubmission(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-64 rounded-xl overflow-hidden border border-[#1E3048]">
              <img
                src={inspectModalSubmission.image}
                alt={inspectModalSubmission.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B131E] p-4 rounded-xl border border-[#1E3048]">
              <div>
                <span className="text-slate-500 text-[10px]">Game</span>
                <p className="font-bold text-white">{inspectModalSubmission.game}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Rank</span>
                <p className="font-bold text-white">{inspectModalSubmission.rank}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Level</span>
                <p className="font-bold text-white">Lvl.{inspectModalSubmission.level}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Skins</span>
                <p className="font-bold text-[#00D2FF]">{inspectModalSubmission.skinsCount} Skins</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-2">
              <span className="text-slate-400 font-bold">Seller Verification Statement:</span>
              <p className="text-slate-300 leading-relaxed">{inspectModalSubmission.description}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInspectModalSubmission(null)}
                className="px-5 py-2.5 rounded-xl bg-[#16253B] text-slate-200 font-bold"
              >
                Close Inspection
              </button>
              {inspectModalSubmission.status === 'pending' && (
                <button
                  onClick={() => {
                    handleApproveSubmission(inspectModalSubmission.id);
                    setInspectModalSubmission(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#070C12] font-black"
                >
                  Approve Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
