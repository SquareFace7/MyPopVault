import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Zap } from 'lucide-react';
import PopArtBackground from '@/components/PopArtBackground';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setSuccess(true);
      toast.success('✉️ Password reset link sent if email exists!', {
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
        className="w-full max-w-md bg-white border-4 border-gray-805 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] overflow-hidden"
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
              <span className="text-pink-500 font-black">Forgot</span> Password
            </h1>
            <p className="text-xs text-gray-500 font-bold mt-1">
              Enter your email and we'll send you a password reset link.
            </p>
          </div>

          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-green-50 border-4 border-green-600 text-green-800 font-bold rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.85)] text-xs">
                ✉️ If that email exists in our system, we have sent a reset link to it. Please check your inbox.
              </div>
              <button
                onClick={() => navigate('/Login')}
                className="flex items-center justify-center gap-1.5 mx-auto font-black text-xs text-pink-500 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="collector@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-10 px-3.5 border-4 border-gray-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.8)] focus:outline-none focus:border-pink-500 focus:shadow-[3px_3px_0px_rgba(236,0,140,0.5)] transition-all bg-white"
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl border-4 border-gray-800 font-black text-white text-base shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                whileHover={loading ? {} : { y: -1.5, boxShadow: '3px 4.5px 0px rgba(0,0,0,0.85)' }}
                whileTap={loading ? {} : { y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Zap className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>

              <button
                type="button"
                onClick={() => navigate('/Login')}
                className="w-full flex items-center justify-center gap-1.5 font-black text-xs text-gray-500 hover:underline pt-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </PopArtBackground>
  );
}
