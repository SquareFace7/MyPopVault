import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, LayoutDashboard, Grid, Home, Menu, X, Sparkles, MessageCircle, Crown, ArrowDownUp, Shield, Zap, Sun, Moon, LogIn, LogOut, MessageSquare, Volume2, VolumeX, Radar } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const navItems = [
  { name: 'Home', page: 'Landing', icon: Home },
  { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
  { name: 'Collection', page: 'Collection', icon: Grid },
  { name: 'Chat', page: 'CommunityChat', icon: MessageCircle, path: '/CommunityChat' },
  { name: 'Messenger', page: 'PopMessenger', icon: MessageSquare, path: '/PopMessenger' },
  { name: 'Collector Search', page: 'CollectorSearch', icon: Radar, path: '/CollectorSearch' },
  { name: 'Explorer', page: 'PopExplorer', icon: Zap, path: '/PopExplorer' },
  { name: 'Trades', page: 'TradeManager', icon: ArrowDownUp, path: '/TradeManager' },
  { name: 'Admin', page: 'AdminPanel', icon: Shield, path: '/AdminPanel' },
];

const renderRoleBadge = (role) => {
  if (role === 'vip') {
    return (
      <span className="ml-1.5 text-[10px] bg-gradient-to-r from-yellow-400 to-orange-550 text-gray-900 px-2 py-0.5 rounded-full border-2 border-gray-800 dark:border-gray-700 font-black uppercase tracking-wider shadow-[1px_1px_0px_rgba(0,0,0,0.8)] dark:shadow-none">
        VIP
      </span>
    );
  }
  if (role === 'admin') {
    return (
      <span className="ml-1.5 text-[10px] bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-2 py-0.5 rounded-full border-2 border-gray-800 dark:border-gray-700 font-black uppercase tracking-wider shadow-[1px_1px_0px_rgba(0,0,0,0.8)] dark:shadow-none">
        ADMIN
      </span>
    );
  }
  return null;
};

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('messenger_muted') === 'true');
  const [pendingTradesCount, setPendingTradesCount] = useState(0);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('messenger_muted', String(nextMuted));
    window.dispatchEvent(new Event('storage'));
    toast.success(nextMuted ? '🔇 Messages muted' : '🔊 Messages unmuted', {
      style: {
        border: '4px solid #1f2937',
        padding: '10px 14px',
        color: '#1f2937',
        fontWeight: 'bold',
        borderRadius: '16px',
      }
    });
  };

  // Sync mute state across components
  React.useEffect(() => {
    const handleStorage = () => {
      setIsMuted(localStorage.getItem('messenger_muted') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Fetch initial unread count
  React.useEffect(() => {
    if (user && user.isLoggedIn) {
      fetch('/api/messages/private/unread-count', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(err => console.error('Error fetching unread count:', err));
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  // Fetch initial pending trades count
  React.useEffect(() => {
    if (user && user.isLoggedIn && (user.role === 'vip' || user.role === 'admin')) {
      fetch('/api/trades/pending-count', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.pendingCount === 'number') {
            setPendingTradesCount(data.pendingCount);
          }
        })
        .catch(err => console.error('Error fetching pending trades count:', err));
    } else {
      setPendingTradesCount(0);
    }
  }, [user]);

  // Sync pending trades count on state triggers
  React.useEffect(() => {
    const handleTradeChange = () => {
      if (user && user.isLoggedIn && (user.role === 'vip' || user.role === 'admin')) {
        fetch('/api/trades/pending-count', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data && typeof data.pendingCount === 'number') {
              setPendingTradesCount(data.pendingCount);
            }
          })
          .catch(err => console.error('Error fetching pending trades count:', err));
      }
    };
    window.addEventListener('trade_status_changed', handleTradeChange);
    return () => window.removeEventListener('trade_status_changed', handleTradeChange);
  }, [user]);

  // Establish global socket room session on mount/login
  React.useEffect(() => {
    if (user && user.isLoggedIn) {
      const userId = user._id || user.id;
      if (!userId) return;

      const socket = io('http://localhost:5000');
      
      console.log(`🔌 [Global Socket] Connecting and registering user: ${userId}`);
      socket.emit('register_user', userId);

      // Listen for unread count updates
      socket.on('unreadCountUpdate', (data) => {
        console.log(`⏰ [Global Socket] Received unreadCountUpdate:`, data.unreadCount);
        setUnreadCount(data.unreadCount);
      });

      // Listen for message broadcasts to trigger notifications
      socket.on('privateMessage', (newMsg) => {
        const msgSender = newMsg.sender?._id || newMsg.sender;
        if (msgSender !== userId && window.activeChatRecipientId !== msgSender) {
          // Play notification sound if not muted
          const currentMuted = localStorage.getItem('messenger_muted') === 'true';
          if (!currentMuted) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
            audio.play().catch(err => console.log('Autoplay blocked:', err));
          }

          toast.success(`💬 New direct message from collector!`, {
            style: {
              border: '4px solid #1f2937',
              padding: '12px 16px',
              color: '#1f2937',
              fontWeight: 'bold',
              borderRadius: '16px',
              boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
            }
          });
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  // Don't show nav on Landing page
  if (currentPageName === 'Landing') {
    return <>{children}</>;
  }

  const visibleNavItems = navItems.filter(item => {
    if (item.page === 'AdminPanel' && user?.role !== 'admin') {
      return false;
    }
    if (item.page === 'PopMessenger' && (user?.role !== 'vip' && user?.role !== 'admin')) {
      return false;
    }
    // Allow Trades link for users, VIPs, and admins (guards inside page handle restrictions)
    if (item.page === 'TradeManager' && (!user || !user.isLoggedIn)) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        
        :root {
          --pop-cyan: #00AEEF;
          --pop-pink: #EC008C;
          --pop-yellow: #FFD700;
          --pop-purple: #9B5DE5;
        }
        
        body {
          font-family: 'Nunito', sans-serif;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 lg:w-64 bg-white dark:bg-gray-900 border-r-2 border-gray-100 dark:border-gray-800 flex-col z-40 transition-colors duration-200">
        {/* Logo */}
        <Link to="/" className="p-4 lg:p-6 group">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(236,0,140,0.5)] transition-shadow"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Package className="w-7 h-7 text-white" />
            </motion.div>
            <div className="hidden lg:block">
              <span className="font-black text-xl">
                <span className="text-cyan-500 group-hover:brightness-110">MyPop</span>
                <span className="text-gray-850 dark:text-white">Vault</span>
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 px-2 lg:px-4 py-4 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = currentPageName === item.page;
            const badgeCount = item.page === 'PopMessenger'
              ? unreadCount
              : item.page === 'TradeManager'
                ? pendingTradesCount
                : item.badge;

            return (
              <Link
                key={item.page}
                to={item.path || createPageUrl(item.page)}
              >
                <motion.div
                  className={`
                    flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-2xl mb-2 transition-colors
                    ${isActive 
                      ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg border-2 border-transparent' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                    }
                  `}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-450 dark:text-gray-550'}`} />
                    {badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-pink-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center text-white font-black px-1" style={{ fontSize: '9px' }}>
                        {badgeCount}
                        <span className="sr-only"> pending items</span>
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block font-bold">{item.name}</span>
                  {badgeCount > 0 && (
                    <span className="hidden lg:flex ml-auto items-center justify-center min-w-[20px] h-5 bg-pink-500 border-2 border-gray-855 dark:border-gray-800 rounded-full text-white font-black px-1 animate-pulse" style={{ fontSize: '9px' }}>
                      {badgeCount}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      className="hidden lg:block ml-auto"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer decoration */}
        <div className="p-4 hidden lg:block border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gradient-to-br from-pink-55 to-cyan-55 dark:from-pink-950/20 dark:to-cyan-950/20 rounded-2xl p-4 text-center border-2 border-transparent dark:border-gray-800">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl">🎮</span>
            </motion.div>
            <p className="text-xs text-gray-500 mt-2 font-black dark:text-gray-400">Level up your collection!</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b-2 border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 z-40 transition-colors duration-200">
        <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-lg">
            <span className="text-cyan-500">MyPop</span>
            <span className="text-gray-850 dark:text-white">Vault</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-805 dark:text-white border-2 border-transparent hover:border-gray-800 dark:hover:border-gray-700 transition-all"
            title="Toggle Theme"
            aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-800 fill-gray-850" />
            )}
          </button>

          {/* Mobile Mute Toggle */}
          {user?.isLoggedIn && (
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-855 dark:text-white border-2 border-transparent hover:border-gray-800 dark:hover:border-gray-700 transition-all"
              title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
              aria-label={isMuted ? "Unmute notifications" : "Mute notifications"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-red-500 fill-red-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-green-500 fill-green-505" />
              )}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
            aria-label={mobileMenuOpen ? "Close main navigation menu" : "Open main navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-30 pt-20 transition-colors duration-200 flex flex-col"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <nav className="p-4 flex-1 flex flex-col justify-between">
              <div className="overflow-y-auto">
                {visibleNavItems.map((item, index) => {
                  const isActive = currentPageName === item.page;
                  const badgeCount = item.page === 'PopMessenger'
                    ? unreadCount
                    : item.page === 'TradeManager'
                      ? pendingTradesCount
                      : item.badge;

                  return (
                    <motion.div
                      key={item.page}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path || createPageUrl(item.page)}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className={`
                          flex items-center gap-4 p-4 rounded-2xl mb-2
                          ${isActive 
                            ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }
                        `}>
                          <div className="relative">
                            <item.icon className="w-6 h-6" />
                            {badgeCount > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-pink-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center text-white font-black px-1" style={{ fontSize: '9px' }}>
                                {badgeCount}
                                <span className="sr-only"> pending items</span>
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-lg">{item.name}</span>
                          {badgeCount > 0 && (
                            <span className="ml-auto flex items-center justify-center min-w-[24px] h-6 bg-pink-500 border-2 border-gray-850 rounded-full text-white font-black text-xs px-1">
                              {badgeCount}
                            </span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile Auth Greeting / Logout */}
              <div className="mt-auto border-t-2 border-gray-100 dark:border-gray-800 pt-4 pb-12">
                {user?.isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-2 w-full">
                      <span className="text-sm font-black text-gray-700 dark:text-gray-200 flex items-center gap-1">
                        👋 Welcome, {user.username || user.email?.split('@')[0]}
                        {renderRoleBadge(user.role)}
                      </span>

                      {/* VIP Upgrade / Badge */}
                      {user.isVIP ? (
                        <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-2 border-gray-800 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-[1px_1px_0px_rgba(0,0,0,0.85)] flex items-center gap-1 shrink-0">
                          👑 VIP Member
                        </span>
                      ) : (
                        <Link
                          to="/vip-upgrade"
                          onClick={() => setMobileMenuOpen(false)}
                          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white border-2 border-gray-800 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-[1px_1px_0px_rgba(0,0,0,0.85)] hover:brightness-110 flex items-center gap-1 shrink-0 transition-all"
                        >
                          👑 Upgrade
                        </Link>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black py-3 rounded-2xl border-4 border-gray-850 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/Login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black py-3 rounded-2xl border-4 border-gray-850 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="md:ml-20 lg:ml-64 pt-16 md:pt-0 h-screen flex flex-col overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-900 border-b-2 border-gray-100 dark:border-gray-800 transition-colors shrink-0">
          <div>
            <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              MyPopVault
            </span>
            <h1 className="text-lg font-black text-gray-850 dark:text-white uppercase tracking-wider mt-0.5">
              {currentPageName === 'CommunityChat' ? 'Community Chat' : currentPageName === 'TradeManager' ? 'Trade Manager' : currentPageName}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Mute/Unmute Toggle */}
            {user?.isLoggedIn && (
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-855 dark:text-white border-2 border-transparent hover:border-gray-855 dark:hover:border-gray-700 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.15)] dark:shadow-none"
                title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
                aria-label={isMuted ? "Unmute notifications" : "Mute notifications"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4 text-green-500 fill-green-500" />
                )}
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-808 dark:text-white border-2 border-transparent hover:border-gray-855 dark:hover:border-gray-700 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.15)] dark:shadow-none"
              title="Toggle Theme"
              aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-800 fill-gray-850" />
              )}
            </button>

            {user?.isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  👋 Welcome, {user.username || user.email?.split('@')[0]}
                  {renderRoleBadge(user.role)}
                </span>

                {/* VIP Upgrade / Badge */}
                {user.isVIP ? (
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-2 border-gray-800 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.85)] flex items-center gap-1 shrink-0">
                    👑 VIP Member
                  </span>
                ) : (
                  <Link
                    to="/vip-upgrade"
                    className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white border-2 border-gray-800 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.85)] hover:brightness-110 flex items-center gap-1 shrink-0 transition-all"
                  >
                    👑 Upgrade to VIP
                  </Link>
                )}
                <motion.button
                  onClick={logout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs px-3.5 py-2 rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                  whileHover={{ y: -1, boxShadow: '2px 3px 0px rgba(0,0,0,0.8)' }}
                  whileTap={{ y: 0, boxShadow: '1px 1px 0px rgba(0,0,0,0.8)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </motion.button>
              </div>
            ) : (
              <Link to="/Login">
                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xs px-3.5 py-2 rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                  whileHover={{ y: -1, boxShadow: '2px 3px 0px rgba(0,0,0,0.8)' }}
                  whileTap={{ y: 0, boxShadow: '1px 1px 0px rgba(0,0,0,0.8)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </motion.div>
              </Link>
            )}
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}