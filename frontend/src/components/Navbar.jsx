import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Crown, LogIn, LogOut, UserPlus, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';

export default function Navbar({ showMenuButton = false, onMenuToggle = () => {}, menuOpen = false }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/Login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-[100] flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b-2 border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
          <img src="/logo.png" alt="MyPopVault" className="h-8 w-8 object-contain shrink-0 mix-blend-multiply dark:mix-blend-screen rounded-md" />
          <span className="text-cyan-500 font-black text-xl tracking-tight">MyPopVault</span>
        </Link>
      </div>

      {/* Action Buttons & Status Indicators */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-transparent hover:border-gray-800 dark:hover:border-gray-700 transition-all shrink-0"
          title="Toggle Theme"
          aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          ) : (
            <Moon className="w-4 h-4 text-gray-800 fill-gray-850" />
          )}
        </button>

        {/* VIP Upgrade / Badge */}
        {user?.isLoggedIn && user.isVIP ? (
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 border-2 border-gray-805 text-[10px] px-2.5 py-1 rounded-xl font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.85)] flex items-center gap-1 shrink-0">
            👑 VIP Member
          </span>
        ) : (
          <Link to="/vip-upgrade">
            <motion.div
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black text-xs px-3.5 py-1.5 rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] hover:brightness-110 shrink-0 transition-all cursor-pointer"
              whileHover={{ y: -1, boxShadow: '2.5px 3.5px 0px rgba(0,0,0,0.85)' }}
              whileTap={{ y: 0, boxShadow: '1.5px 1.5px 0px rgba(0,0,0,0.85)' }}
            >
              <Crown className="w-3.5 h-3.5" />
              VIP
            </motion.div>
          </Link>
        )}

        {/* User Greeting & Auth Triggers */}
        {user?.isLoggedIn ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-black text-gray-700 dark:text-gray-200">
              👋 Welcome, {user.username || user.email?.split('@')[0]}
            </span>
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] shrink-0"
              whileHover={{ y: -1, boxShadow: '2.5px 3.5px 0px rgba(0,0,0,0.85)' }}
              whileTap={{ y: 0, boxShadow: '1.5px 1.5px 0px rgba(0,0,0,0.85)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/Login" state={{ activeTab: 'login' }}>
              <motion.div
                className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] shrink-0 cursor-pointer"
                whileHover={{ y: -1, boxShadow: '2.5px 3.5px 0px rgba(0,0,0,0.85)' }}
                whileTap={{ y: 0, boxShadow: '1.5px 1.5px 0px rgba(0,0,0,0.85)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </motion.div>
            </Link>
            <Link to="/Login" state={{ activeTab: 'signup' }}>
              <motion.div
                className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] shrink-0 cursor-pointer"
                whileHover={{ y: -1, boxShadow: '2.5px 3.5px 0px rgba(0,0,0,0.85)' }}
                whileTap={{ y: 0, boxShadow: '1.5px 1.5px 0px rgba(0,0,0,0.85)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </motion.div>
            </Link>
          </div>
        )}

        {/* Mobile Sidebar Hamburger Toggle */}
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-transparent hover:border-gray-850 dark:hover:border-gray-700 transition-all ml-1 shrink-0"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>
    </nav>
  );
}
