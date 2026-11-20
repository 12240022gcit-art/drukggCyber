import { useCallback, useEffect, useState } from 'react';
import { clearSession, hasSession, SESSION_EXPIRED_EVENT } from '../models/apiClient';
import { checkSession, getCurrentUser, register, signIn, signOut } from '../models/authModel';
import { getAccounts } from '../models/accountsModel';
import { placeOrder } from '../models/ordersModel';
import { submitAccount } from '../models/sellerModel';
import {
  getNotifications,
  getSupportMessages,
  markNotificationsRead,
  sendSupportMessage,
} from '../models/supportModel';
import { AdminNotification, AdminChatMessage, GameAccount, ScreenType, SessionUser } from '../models/marketplace';

export function useAppController() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => (
    window.location.pathname.replace(/\/+$/, '') === '/admin' ? 'signin' : 'home'
  ));
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<GameAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [orderNumber, setOrderNumber] = useState('');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminChatMessage[]>([]);

  const loadAccounts = useCallback(async () => {
    const result = await getAccounts();
    setAccounts(result.accounts);
  }, []);

  const loadSupport = useCallback(async () => {
    if (!hasSession()) return;
    try {
      const [notifications, messages] = await Promise.all([
        getNotifications(),
        getSupportMessages(),
      ]);
      setAdminNotifications(notifications.notifications);
      setAdminMessages(messages.messages);
    } catch (error) {
      if (error.status !== 401) setErrorMessage(error.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      getAccounts(),
      getCurrentUser().catch((error) => {
        clearSession();
        if (error.status !== 401) throw error;
        return null;
      }),
    ]).then(([accountResult, sessionResult]) => {
      if (!active) return;
      setAccounts(accountResult.accounts);
      setUser(sessionResult?.user || null);
      if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
        setCurrentScreen(sessionResult?.user?.role === 'admin' ? 'admin-dashboard' : 'signin');
      }
      if (sessionResult?.user) void loadSupport();
    }).catch((error) => {
      if (active) setErrorMessage(error.message);
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [loadSupport]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setAdminNotifications([]);
      setAdminMessages([]);
      setCurrentScreen('signin');
      setErrorMessage('Your session expired. Please sign in again.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  useEffect(() => {
    if (!user || !hasSession()) return;
    const interval = window.setInterval(() => {
      void checkSession().catch(() => {});
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [user]);

  const handleNavigate = (screen: ScreenType) => {
    if (screen === 'home' && window.location.pathname.replace(/\/+$/, '') === '/admin') {
      window.history.replaceState(null, '', '/');
    }
    setErrorMessage('');
    if (screen === 'home' || screen === 'browse') {
      void loadAccounts().catch((error) => setErrorMessage(error.message));
    }
    if (['profile', 'listings', 'orders', 'submit-account'].includes(screen) && !user) {
      setCurrentScreen('signin');
      setErrorMessage('Please sign in to continue.');
      return;
    }
    if (screen === 'admin-dashboard' && user?.role !== 'admin') {
      setCurrentScreen('signin');
      setErrorMessage('Admin access requires a staff account.');
      return;
    }
    setCurrentScreen(screen);
  };

  const handleSelectAccount = (account: GameAccount) => setSelectedAccount(account);

  const handleProceedToCheckout = (account: GameAccount) => {
    setSelectedAccount(account);
    setCurrentScreen(user ? 'checkout' : 'signin');
    if (!user) setErrorMessage('Sign in before placing an order.');
  };

  const handleSignIn = async (credentials: { email: string; password: string }, role: 'user' | 'admin') => {
    setErrorMessage('');
    try {
      const signedInUser = await signIn(credentials, role);
      setUser(signedInUser);
      setCurrentScreen(role === 'admin' ? 'admin-dashboard' : 'profile');
      void loadSupport();
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    }
  };

  const handleRegister = async (details: { name: string; email: string; password: string }) => {
    setErrorMessage('');
    try {
      const registeredUser = await register(details);
      setUser(registeredUser);
      setCurrentScreen('profile');
      void loadSupport();
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    }
  };

  const handlePlaceOrder = async (account: GameAccount, paymentMethod: string) => {
    if (!user) {
      setCurrentScreen('signin');
      setErrorMessage('Sign in before placing an order.');
      return;
    }
    setErrorMessage('');
    try {
      const result = await placeOrder(account.id, paymentMethod);
      setOrderNumber(result.order.orderNumber);
      setCurrentScreen('order-success');
      await loadSupport();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSubmitSuccess = async (details: Record<string, string>) => {
    if (!user) {
      setCurrentScreen('signin');
      setErrorMessage('Sign in to submit an account for review.');
      return;
    }
    setErrorMessage('');
    try {
      await submitAccount(details);
      setCurrentScreen('submit-success');
      await loadSupport();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSendMessageToAdmin = async (text: string) => {
    try {
      await sendSupportMessage(text);
      await loadSupport();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await markNotificationsRead();
      setAdminNotifications((previous) => previous.map((notice) => ({ ...notice, unread: false })));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setUser(null);
      setAdminNotifications([]);
      setAdminMessages([]);
      setCurrentScreen('signin');
    }
  };

  return {
    currentScreen,
    accounts,
    selectedAccount,
    searchQuery,
    setSearchQuery,
    selectedGameFilter,
    setSelectedGameFilter,
    orderNumber,
    user,
    errorMessage,
    setErrorMessage,
    isLoading,
    isAdminChatOpen,
    setIsAdminChatOpen,
    adminNotifications,
    adminMessages,
    unreadAlertsCount: adminNotifications.filter((notice) => notice.unread).length,
    handleNavigate,
    handleSelectAccount,
    handleProceedToCheckout,
    handleSignIn,
    handleRegister,
    handlePlaceOrder,
    handleSubmitSuccess,
    handleSendMessageToAdmin,
    handleMarkNotificationsRead,
    handleLogout,
  };
}
