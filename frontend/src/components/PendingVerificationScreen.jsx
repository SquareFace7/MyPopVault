import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, LogOut, CheckCircle, Package, Send } from 'lucide-react';
import PopArtBackground from '@/components/PopArtBackground';
import toast from 'react-hot-toast';

export default function PendingVerificationScreen({ user, logout, checkUserAuth }) {
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to resend verification email.');
      }
      
      toast.success('✉️ Verification link sent! Please check your inbox.', {
        duration: 5000,
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
    } catch (err) {
      console.error('Resend Error:', err);
      toast.error(`⚠️ ${err.message}`, {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const updatedUser = await checkUserAuth();
      if (updatedUser && updatedUser.isVerified) {
        toast.success('🎉 Email verified successfully! Welcome to MyPopVault.', {
          duration: 5000,
          style: {
            border: '4px solid #1f2937',
            padding: '16px',
            color: '#1f2937',
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
          }
        });
      } else {
        toast.error('⚠️ Verification not detected yet. Please check your inbox and verify.', {
          duration: 5000,
          style: {
            border: '4px solid #1f2937',
            padding: '16px',
            color: '#1f2937',
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
          }
        });
      }
    } catch (err) {
      console.error('Check Status Error:', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <PopArtBackground className="w-full min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-gray-950 font-sans">
      <motion.div
        className="w-full max-w-lg bg-white border-4 border-gray-800 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] overflow-hidden"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Header gradient bar */}
        <div className="h-3 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />

        {/* Card Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl border-4 border-gray-800 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.8)] relative"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Mail className="w-10 h-10 text-white" />
              <motion.div 
                className="absolute -top-2 -right-2 bg-pink-500 text-white border-2 border-gray-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                !
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2">
            Verify Your <span className="text-pink-500">Email</span>
          </h1>
          
          <div className="bg-slate-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-3 mb-6 inline-block">
            <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Registered Email</span>
            <span className="text-sm font-black text-gray-800 dark:text-gray-200">{user?.email}</span>
          </div>

          {/* Prompt Message */}
          <p className="text-base text-gray-700 dark:text-gray-300 font-bold leading-relaxed mb-8 px-2">
            We sent a verification link to your email address. Please check your inbox and click the link to unlock your vault.
          </p>

          {/* Main Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Check Status */}
              <motion.button
                onClick={handleCheckStatus}
                disabled={checking || resending}
                className="h-14 bg-cyan-400 hover:bg-cyan-500 text-gray-950 border-4 border-gray-800 rounded-2xl font-black text-sm shadow-[4px_4px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={checking || resending ? {} : { y: -2, boxShadow: '4px 6px 0px rgba(0,0,0,0.85)' }}
                whileTap={checking || resending ? {} : { y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Checking...' : "I've Verified"}
              </motion.button>

              {/* Resend Email */}
              <motion.button
                onClick={handleResend}
                disabled={checking || resending}
                className="h-14 bg-pink-600 hover:bg-pink-700 text-white border-4 border-gray-800 rounded-2xl font-black text-sm shadow-[4px_4px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={checking || resending ? {} : { y: -2, boxShadow: '4px 6px 0px rgba(0,0,0,0.85)' }}
                whileTap={checking || resending ? {} : { y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
              >
                <Send className={`w-4 h-4 ${resending ? 'animate-pulse' : ''}`} />
                {resending ? 'Sending...' : 'Resend Email'}
              </motion.button>
            </div>

            {/* Logout */}
            <motion.button
              onClick={logout}
              className="w-full h-12 bg-white hover:bg-gray-100 text-gray-600 border-4 border-gray-800 rounded-2xl font-black text-sm shadow-[4px_4px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-2 transition-colors"
              whileHover={{ y: -2, boxShadow: '4px 6px 0px rgba(0,0,0,0.85)' }}
              whileTap={{ y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
            >
              <LogOut className="w-4 h-4" />
              Log Out / Switch Account
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t-4 border-gray-800 px-8 py-4 text-center">
          <p className="text-xs text-gray-500 font-bold flex items-center justify-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-gray-400" />
            MyPopVault Security Protection System
          </p>
        </div>
      </motion.div>
    </PopArtBackground>
  );
}
