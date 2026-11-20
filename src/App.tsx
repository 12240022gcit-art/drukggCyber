import { AdminChatModal } from './components/AdminChatModal';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { useAppController } from './controllers/useAppController';
import { AccountDetailView } from './views/AccountDetailView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { BrowseView } from './views/BrowseView';
import { CheckoutView } from './views/CheckoutView';
import { HomeView } from './views/HomeView';
import { ListingsView } from './views/ListingsView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { ProfileView } from './views/ProfileView';
import { SellLandingView } from './views/SellLandingView';
import { SignInView } from './views/SignInView';
import { SignUpView } from './views/SignUpView';
import { SplashView } from './views/SplashView';
import { SubmitAccountView } from './views/SubmitAccountView';
import { SubmitSuccessView } from './views/SubmitSuccessView';

export default function App() {
  const controller = useAppController();
  const isAdminLoginRoute = window.location.pathname.replace(/\/+$/, '') === '/admin';
  const {
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
    unreadAlertsCount,
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
  } = controller;

  const openSupport = () => {
    if (!user) {
      handleNavigate('signin');
      return;
    }
    setIsAdminChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070C12] text-slate-100 flex flex-col font-sans selection:bg-[#00D2FF]/30 selection:text-[#00D2FF]">
      {currentScreen !== 'splash' && currentScreen !== 'admin-dashboard' && (
        <Header
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAdminChat={openSupport}
          unreadAdminAlertsCount={unreadAlertsCount}
          userName={user?.name}
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        {errorMessage && (
          <div role="alert" className="mb-5 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 flex items-center justify-between gap-4">
            <span>{errorMessage}</span>
            <button type="button" className="text-red-100 underline" onClick={() => setErrorMessage('')}>Dismiss</button>
          </div>
        )}
        {isLoading ? (
          <div className="py-24 text-center font-mono text-sm text-slate-400">Connecting to DrukGG…</div>
        ) : (
          <>
            {currentScreen === 'home' && (
              <HomeView
                onNavigate={handleNavigate}
                onSelectAccount={handleSelectAccount}
                onSelectGameFilter={setSelectedGameFilter}
                accounts={accounts}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}
            {currentScreen === 'browse' && (
              <BrowseView
                onNavigate={handleNavigate}
                onSelectAccount={handleSelectAccount}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedGameFilter={selectedGameFilter}
                onSelectGameFilter={setSelectedGameFilter}
                accounts={accounts}
              />
            )}
            {currentScreen === 'detail' && selectedAccount && (
              <AccountDetailView account={selectedAccount} onNavigate={handleNavigate} onProceedToCheckout={handleProceedToCheckout} />
            )}
            {currentScreen === 'checkout' && selectedAccount && (
              <CheckoutView account={selectedAccount} onNavigate={handleNavigate} onPlaceOrder={handlePlaceOrder} />
            )}
            {currentScreen === 'order-success' && (
              <OrderSuccessView
                onNavigate={(screen) => handleNavigate(screen === 'orders' ? 'listings' : screen)}
                orderNumber={orderNumber}
              />
            )}
            {(currentScreen === 'listings' || currentScreen === 'orders') && (
              <ListingsView
                onNavigate={handleNavigate}
                onOpenAdminChat={() => setIsAdminChatOpen(true)}
                initialBranch={currentScreen === 'orders' ? 'orders' : 'listings'}
              />
            )}
            {currentScreen === 'sell' && <SellLandingView onNavigate={handleNavigate} />}
            {currentScreen === 'submit-account' && (
              <SubmitAccountView onNavigate={handleNavigate} onSubmitSuccess={handleSubmitSuccess} />
            )}
            {currentScreen === 'submit-success' && <SubmitSuccessView onNavigate={handleNavigate} />}
            {currentScreen === 'profile' && user && (
              <ProfileView
                user={user}
                onLogout={handleLogout}
                onNavigate={(screen) => handleNavigate(screen === 'orders' ? 'listings' : screen)}
              />
            )}
            {currentScreen === 'signin' && (
              <SignInView
                onNavigate={handleNavigate}
                onAuthenticate={handleSignIn}
                isAdminLogin={isAdminLoginRoute}
              />
            )}
            {currentScreen === 'admin-dashboard' && user?.role === 'admin' && (
              <AdminDashboardView onNavigate={handleNavigate} onLogoutAdmin={handleLogout} />
            )}
            {currentScreen === 'signup' && (
              <SignUpView onNavigate={handleNavigate} onRegister={handleRegister} />
            )}
            {currentScreen === 'splash' && <SplashView onNavigate={handleNavigate} />}
          </>
        )}
      </main>

      {currentScreen !== 'splash' && currentScreen !== 'admin-dashboard' && (
        <Footer onNavigate={(screen) => handleNavigate(screen === 'orders' ? 'listings' : screen)} />
      )}

      <AdminChatModal
        isOpen={isAdminChatOpen}
        onClose={() => setIsAdminChatOpen(false)}
        notifications={adminNotifications}
        messages={adminMessages}
        onSendMessage={handleSendMessageToAdmin}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />
    </div>
  );
}
