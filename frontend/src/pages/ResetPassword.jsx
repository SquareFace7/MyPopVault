import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Zap } from 'lucide-react';
import PopArtBackground from '@/components/PopArtBackground';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('⚠️ Passwords do not match!', {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error('⚠️ Password must be at least 6 characters long', {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success('🎉 Password reset successfully! You can now log in.', {
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
      navigate('/Login');
    } catch (err) {
      console.error(err);
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
      setLoading(false);
    }
  };

  return (
    <PopArtBackground className="w-full h-full flex flex-col items-center justify-center px-4 py-6 bg-slate-50 dark:bg-gray-950 font-sans">
      <motion.div
        className="w-full max-w-md bg-white border-4 border-gray-850 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] overflow-hidden"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="h-2.5 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />

        <div className="px-6 pt-5 pb-6">
          <div className="flex justify-center mb-3">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-xl border-4 border-gray-800 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Package className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          <div className="text-center mb-5">
            <h1 className="text-2xl font-black text-gray-800">
              <span className="text-cyan-500 font-black">Reset</span> Password
            </h1>
            <p className="text-xs text-gray-500 font-bold mt-1">
              Enter and confirm your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full h-10 px-3.5 border-4 border-gray-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.8)] focus:outline-none focus:border-cyan-500 focus:shadow-[3px_3px_0px_rgba(0,174,239,0.5)] transition-all bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 mb-1" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full h-10 px-3.5 border-4 border-gray-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.8)] focus:outline-none focus:border-pink-500 focus:shadow-[3px_3px_0px_rgba(236,0,140,0.5)] transition-all bg-white"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl border-4 border-gray-800 font-black text-white text-base shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              whileHover={loading ? {} : { y: -1.5, boxShadow: '3px 4.5px 0px rgba(0,0,0,0.85)' }}
              whileTap={loading ? {} : { y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Zap className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>

            <button
              type="button"
              onClick={() => navigate('/Login')}
              className="w-full flex items-center justify-center gap-1.5 font-black text-xs text-gray-500 hover:underline pt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </form>
        </div>
      </motion.div>
    </PopArtBackground>
  );
}
