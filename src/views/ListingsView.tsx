import React, { useEffect, useState } from 'react';
import { ScreenType, OrderItem, MyListingItem } from '../models/marketplace';
import { downloadTextFile } from '../models/apiClient';
import { getListings, getOrders, updateListingPrice } from '../models/ordersModel';
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  Clock, 
  Check, 
  Download, 
  MessageSquare, 
  PlusCircle, 
  Eye,
  Building2,
  X
} from 'lucide-react';

interface ListingsViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenAdminChat: () => void;
  initialBranch?: 'orders' | 'listings';
}

export const ListingsView: React.FC<ListingsViewProps> = ({
  onNavigate,
  onOpenAdminChat,
  initialBranch = 'orders',
}) => {
  const [activeBranch, setActiveBranch] = useState<'orders' | 'listings'>(initialBranch);
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'review' | 'sold'>('all');
  const [selectedCredentials, setSelectedCredentials] = useState<OrderItem | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [myListings, setMyListings] = useState<MyListingItem[]>([]);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    Promise.all([getOrders(), getListings()]).then(([orderResult, listingResult]) => {
      setOrders(orderResult.orders);
      setMyListings(listingResult.listings);
    }).catch((error) => setPageError(error.message));
  }, []);

  const filteredOrders = orders.filter((ord) => {
    if (orderFilter === 'active') return ord.status === 'Processing';
    if (orderFilter === 'completed') return ord.status === 'Completed';
    return true;
  });

  const filteredListings = myListings.filter((lst) => {
    if (listingFilter === 'active') return lst.status === 'Active';
    if (listingFilter === 'review') return lst.status === 'Under Review';
    if (listingFilter === 'sold') return lst.status === 'Sold';
    return true;
  });

  const handleEditPrice = async (listing: MyListingItem) => {
    const input = window.prompt('Enter the new selling price in Nu.', String(listing.price));
    if (input === null) return;
    try {
      await updateListingPrice(listing.id, Number(input));
      const { listings } = await getListings();
      setMyListings(listings);
      setPageError('');
    } catch (error) {
      setPageError(error.message);
    }
  };

  const downloadOrderReceipt = (order: OrderItem) => {
    downloadTextFile(`drukgg-${order.orderNumber.replace('#', '')}-order.txt`, [
      'DrukGG order summary',
      `Order: ${order.orderNumber}`,
      `Account: ${order.accountTitle}`,
      `Game: ${order.game}`,
      `Price: Nu. ${order.price}`,
      `Date: ${order.date}`,
      `Status: ${order.status}`,
    ].join('\n'));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {pageError && <p role="alert" className="text-sm text-red-400">{pageError}</p>}
      
      {/* Top Breadcrumb & Admin Notification Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E3048] pb-4 gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-[#00D2FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Admin Desk Quick Access Trigger */}
        <button
          onClick={onOpenAdminChat}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#111C2B] hover:bg-[#16253B] text-slate-200 border border-[#00D2FF]/40 text-xs font-mono transition-all group"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D2FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D2FF]"></span>
          </span>
          <span className="text-slate-300 group-hover:text-white">DrukGG Admin Desk</span>
          <span className="text-[#00D2FF] font-bold">2 Alerts / Chat →</span>
        </button>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-3xl font-mono font-bold text-white tracking-tight">
          Listings & Orders Hub
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Manage your purchased gaming accounts and accounts you have put up for sale in Bhutan.
        </p>
      </div>

      {/* TWO PRIMARY BRANCHES (Branch 1: My Orders | Branch 2: My Listings) */}
      <div className="bg-[#111C2B] p-1.5 rounded-2xl border border-[#1E3048] grid grid-cols-2 gap-2 shadow-xl">
        <button
          onClick={() => setActiveBranch('orders')}
          className={`py-3.5 px-4 rounded-xl font-mono text-sm font-bold transition-all flex items-center justify-center gap-3 ${
            activeBranch === 'orders'
              ? 'bg-[#00D2FF] text-[#070C12] shadow-[0_0_20px_rgba(0,210,255,0.35)]'
              : 'text-slate-400 hover:text-white hover:bg-[#16253B]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders (Purchased Accounts)</span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            activeBranch === 'orders' ? 'bg-[#070C12]/20 text-[#070C12]' : 'bg-[#1E3048] text-slate-300'
          }`}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveBranch('listings')}
          className={`py-3.5 px-4 rounded-xl font-mono text-sm font-bold transition-all flex items-center justify-center gap-3 ${
            activeBranch === 'listings'
              ? 'bg-[#00D2FF] text-[#070C12] shadow-[0_0_20px_rgba(0,210,255,0.35)]'
              : 'text-slate-400 hover:text-white hover:bg-[#16253B]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>My Listings (Accounts For Sale)</span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            activeBranch === 'listings' ? 'bg-[#070C12]/20 text-[#070C12]' : 'bg-[#1E3048] text-slate-300'
          }`}>
            {myListings.length}
          </span>
        </button>
      </div>

      {/* BRANCH 1: MY ORDERS (The things we ordered) */}
      {activeBranch === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Filter Sub-Tabs for Orders matching wireframe */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  orderFilter === 'all'
                    ? 'bg-[#1E3048] text-[#00D2FF] border border-[#00D2FF]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('active')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  orderFilter === 'active'
                    ? 'bg-[#1E3048] text-[#00D2FF] border border-[#00D2FF]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                Active Handover ({orders.filter((order) => order.status === 'Processing').length})
              </button>
              <button
                onClick={() => setOrderFilter('completed')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  orderFilter === 'completed'
                    ? 'bg-[#1E3048] text-[#00D2FF] border border-[#00D2FF]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                Completed ({orders.filter((order) => order.status === 'Completed').length})
              </button>
            </div>

            <button
              onClick={() => onNavigate('browse')}
              className="text-xs font-mono text-[#00D2FF] hover:underline flex items-center gap-1"
            >
              <span>+ Order Another Account</span>
            </button>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF]/50 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#070C12] border border-[#1E3048] shrink-0">
                      <img
                        src={order.image}
                        alt={order.accountTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-white text-lg">
                        {order.accountTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                        <span>Order {order.orderNumber}</span>
                        <span>·</span>
                        <span>{order.date}</span>
                        <span>·</span>
                        <span className="text-slate-300">{order.paymentMethod === 'bank' ? 'Bank Transfer (Bhutan)' : order.paymentMethod === 'ewallet' ? 'eWallet' : 'Other Payment Method'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xl text-white">
                      Nu. <span className="text-[#00D2FF]">{order.price.toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      {order.paymentStatus === 'paid' ? 'Payment marked paid by admin' : 'Payment verification pending'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E3048] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold">
                    {order.status === 'Processing' ? (
                      <span className="flex items-center gap-2 text-[#F59E0B]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block animate-pulse"></span>
                        Processing Handover
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[#10B981]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block"></span>
                        Marked complete
                      </span>
                    )}
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 text-[11px]">
                      {order.status === 'Processing'
                        ? 'Payment and transfer verification pending'
                        : 'Handover is not tracked by this app'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {order.status === 'Processing' ? (
                      <>
                        <button
                          onClick={onOpenAdminChat}
                          className="px-3.5 py-1.5 rounded-lg bg-[#00D2FF]/15 text-[#00D2FF] hover:bg-[#00D2FF]/25 border border-[#00D2FF]/30 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Talk to Admin</span>
                        </button>
                        <button
                          onClick={() => setSelectedCredentials(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#16253B] text-slate-300 hover:text-white border border-[#1E3048] text-xs font-mono transition-colors"
                        >
                          Escrow Status
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedCredentials(order)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 border border-[#10B981]/30 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>View Handover Status</span>
                        </button>
                        <button
                          onClick={() => downloadOrderReceipt(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#16253B] text-slate-300 hover:text-white border border-[#1E3048] text-xs font-mono transition-colors flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BRANCH 2: MY LISTINGS (Accounts we have put up for sale) */}
      {activeBranch === 'listings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Seller Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#111C2B] border border-[#1E3048] space-y-1">
              <span className="text-xs font-mono text-slate-400">Total Listed Value</span>
              <p className="text-xl font-mono font-bold text-[#00D2FF]">Nu. {myListings.reduce((total, listing) => total + listing.price, 0).toLocaleString()}</p>
              <span className="text-[10px] font-mono text-slate-500">{myListings.length} total accounts submitted</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111C2B] border border-[#1E3048] space-y-1">
              <span className="text-xs font-mono text-slate-400">In Active Escrow</span>
              <p className="text-xl font-mono font-bold text-amber-400">Nu. {orders.filter((order) => order.status === 'Processing').reduce((total, order) => total + order.price, 0).toLocaleString()}</p>
              <span className="text-[10px] font-mono text-slate-500">{orders.filter((order) => order.status === 'Processing').length} orders pending handover</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111C2B] border border-[#1E3048] space-y-1">
              <span className="text-xs font-mono text-slate-400">Total Payouts Received</span>
              <p className="text-xl font-mono font-bold text-[#10B981]">Nu. {orders.filter((order) => order.status === 'Completed').reduce((total, order) => total + order.price, 0).toLocaleString()}</p>
              <span className="text-[10px] font-mono text-slate-500">Completed orders</span>
            </div>
          </div>

          {/* Filter Sub-Tabs for Listings + Put Up For Sale CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setListingFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  listingFilter === 'all'
                    ? 'bg-[#1E3048] text-[#00D2FF] border border-[#00D2FF]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                All Listings ({myListings.length})
              </button>
              <button
                onClick={() => setListingFilter('active')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  listingFilter === 'active'
                    ? 'bg-[#1E3048] text-[#00D2FF] border border-[#00D2FF]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                Active On Market ({myListings.filter((listing) => listing.status === 'Active').length})
              </button>
              <button
                onClick={() => setListingFilter('review')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  listingFilter === 'review'
                    ? 'bg-[#1E3048] text-[#00D2FF] border border-[#00D2FF]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                Under Review ({myListings.filter((listing) => listing.status === 'Under Review').length})
              </button>
              <button
                onClick={() => setListingFilter('sold')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  listingFilter === 'sold'
                    ? 'bg-[#1E3048] text-[#00D2FF] border border-[#00D2FF]/40'
                    : 'bg-[#111C2B] text-slate-400 hover:text-white border border-[#1E3048]'
                }`}
              >
                Sold & Paid ({myListings.filter((listing) => listing.status === 'Sold').length})
              </button>
            </div>

            <button
              onClick={() => onNavigate('submit-account')}
              className="px-4 py-2 rounded-xl bg-[#00D2FF] text-[#070C12] font-mono text-xs font-bold hover:bg-[#33DCFF] transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Put Account Up For Sale</span>
            </button>
          </div>

          {/* Listings List (Accounts We Put Up For Sale) */}
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="p-6 rounded-2xl bg-[#111C2B] border border-[#1E3048] hover:border-[#00D2FF]/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#070C12] border border-[#1E3048] shrink-0">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono font-bold text-white text-lg">
                          {listing.title}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16253B] text-slate-300 border border-[#1E3048]">
                          {listing.listingCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                        <span>{listing.game}</span>
                        <span>·</span>
                        <span>{listing.rank} (Lvl.{listing.level})</span>
                        <span>·</span>
                        <span>Listed: {listing.dateListed}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xl text-white">
                      Nu. <span className="text-[#00D2FF]">{listing.price.toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Payout: <strong className="text-slate-200">{listing.payoutAccount}</strong>
                    </div>
                  </div>
                </div>

                {/* Metadata & Actions row */}
                <div className="pt-3 border-t border-[#1E3048] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 font-mono text-xs">
                    {/* Status Badge */}
                    {listing.status === 'Active' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        Active on Marketplace
                      </span>
                    )}
                    {listing.status === 'Under Review' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Under Admin Review
                      </span>
                    )}
                    {listing.status === 'Sold' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 font-bold">
                        <Building2 className="w-3.5 h-3.5" />
                        Sold & Payout Cleared
                      </span>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        {listing.viewsCount} Views
                      </span>
                      <span>·</span>
                      <span>{listing.offersCount} Buyer Inquiries</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {listing.status === 'Active' && (
                      <>
                        <button
                          onClick={() => handleEditPrice(listing)}
                          className="px-3 py-1.5 rounded-lg bg-[#16253B] text-slate-300 hover:text-white border border-[#1E3048] text-xs font-mono transition-colors"
                        >
                          Edit Price
                        </button>
                        <button
                          onClick={onOpenAdminChat}
                          className="px-3.5 py-1.5 rounded-lg bg-[#00D2FF]/15 text-[#00D2FF] hover:bg-[#00D2FF]/25 border border-[#00D2FF]/30 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Admin Talk</span>
                        </button>
                      </>
                    )}

                    {listing.status === 'Under Review' && (
                      <>
                        <button
                          onClick={onOpenAdminChat}
                          className="px-3.5 py-1.5 rounded-lg bg-[#00D2FF] text-[#070C12] hover:bg-[#33DCFF] text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Talk with Admin Tshering</span>
                        </button>
                      </>
                    )}

                    {listing.status === 'Sold' && (
                      <>
                        <button
                          onClick={() => downloadTextFile(`drukgg-${listing.listingCode.replace('#', '')}-payout.txt`, `${listing.title}\nPayout status: ${listing.payoutStatus}\nAmount: Nu. ${listing.price}`)}
                          className="px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-mono font-semibold"
                        >
                          View mBOB Receipt
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order handover status */}
      {selectedCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#111C2B] border border-[#1E3048] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-[#1E3048] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00D2FF]" />
                <h3 className="font-bold text-white text-base">
                  Order Status ({selectedCredentials.orderNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCredentials(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedCredentials.status === 'Completed' ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0B131E] border border-[#1E3048] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account:</span>
                    <strong className="text-[#00D2FF]">{selectedCredentials.accountTitle}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order status:</span>
                    <strong className="text-white">Marked complete</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  This app does not store or deliver game login credentials. Never share passwords, one-time codes, or recovery keys in chat.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-[#0B131E] border border-[#F59E0B]/30 text-center space-y-2">
                  <Clock className="w-8 h-8 text-[#F59E0B] mx-auto animate-spin" />
                  <h4 className="font-bold text-white">Verification in Progress</h4>
                  <p className="text-slate-400 text-[11px]">
                    The order is awaiting manual payment verification. This app does not process payments or transfer credentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCredentials(null);
                    onOpenAdminChat();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#00D2FF] text-[#070C12] font-bold text-xs"
                >
                  Message Admin for Status
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedCredentials(null)}
              className="w-full py-2.5 rounded-xl bg-[#16253B] text-slate-200 text-xs font-bold hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
