export type ScreenType =
  | 'home'
  | 'browse'
  | 'detail'
  | 'checkout'
  | 'order-success'
  | 'orders'
  | 'listings'
  | 'sell'
  | 'submit-account'
  | 'submit-success'
  | 'profile'
  | 'signin'
  | 'signup'
  | 'splash'
  | 'admin-dashboard';

export interface GameAccount {
  id: string;
  title: string;
  game: string;
  gameKey: 'mlbb' | 'efootball' | 'pubg' | 'freefire' | 'valorant';
  level: number;
  rank: string;
  skinsCount: number;
  heroesCount?: number;
  server: string;
  price: number;
  isVerified: boolean;
  image: string;
  thumbnail: string;
  description: string;
  seller: {
    name: string;
    verified: boolean;
    rating: number;
    salesCount: number;
  };
  specs: {
    game: string;
    level: number;
    currentRank: string;
    heroes?: number;
    skins: number;
    server: string;
  };
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  accountId: string;
  accountTitle: string;
  game: string;
  price: number;
  date: string;
  status: 'Processing' | 'Completed' | 'Pending Verification';
  image: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface MyListingItem {
  id: string;
  listingCode: string;
  title: string;
  game: string;
  price: number;
  dateListed: string;
  status: 'Active' | 'Under Review' | 'Sold';
  viewsCount: number;
  offersCount: number;
  image: string;
  rank: string;
  level: number;
  payoutStatus?: string;
  payoutAccount?: string;
}

export interface ListingSubmission {
  id: string;
  submissionCode: string;
  sellerName: string;
  sellerPhone: string;
  sellerCid: string;
  sellerBank: string;
  game: string;
  title: string;
  rank: string;
  level: number;
  skinsCount: number;
  server: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  image: string;
  description: string;
  rejectionReason?: string;
  userId?: string;
}

export interface AdminConversation {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userPhone: string;
  activeContext: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: AdminChatMessage[];
}

export interface EscrowTransaction {
  id: string;
  orderNumber: string;
  accountTitle: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  platformFee: number;
  sellerPayout: number;
  bankRef: string;
  paymentMethod: string;
  status: 'payment_pending' | 'held_in_escrow' | 'payout_released' | 'refunded';
  initiatedAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  type: 'approval' | 'escrow' | 'security' | 'chat';
  relatedId?: string;
}

export interface AdminChatMessage {
  id: string;
  sender: 'admin' | 'user';
  text: string;
  timestamp: string;
  adminName?: string;
  adminRole?: string;
}

export interface UserProfile {
  name: string;
  initials: string;
  verified: boolean;
  ordersCount: number;
  listingsCount: number;
  reviewsCount: number;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}
