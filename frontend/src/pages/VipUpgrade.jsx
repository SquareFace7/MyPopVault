import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import PopArtBackground from '@/components/PopArtBackground';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';

export default function VipUpgrade() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl('/api/payment/create-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      console.error(err);
      toast.error(`⚠️ Stripe Error: ${err.message}`, {
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

  const benefits = [
    { title: 'Unlimited Vault Storage', desc: 'Add infinitely many pops to your collection without any caps.' },
    { title: 'Exclusive VIP Badges', desc: 'Display a premium crown icon on search lists and public vaults.' },
    { title: 'Access Private Chat Channels', desc: 'Chat 1-on-1 and negotiate exclusive trading offers with other VIP collectors.' },
    { title: 'Grail Alerts & Price Tracker', desc: 'Pin hard-to-find Pops and receive instant alerts when their value drops.' }
  ];

  return (
    <PopArtBackground className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8 bg-slate-50 dark:bg-gray-950 font-sans">
      <motion.div
        className="w-full max-w-2xl bg-white border-4 border-gray-800 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] overflow-hidden"
        initial={{ opacity: 0, y: 35, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Banner */}
        <div className="h-4 w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500" />

        <div className="px-6 py-8 md:px-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 border-4 border-gray-800 rounded-3xl shadow-[3px_3px_0px_rgba(0,0,0,0.85)] mb-4">
              <Crown className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight uppercase">
              Go <span className="text-yellow-500">VIP Premium</span>
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-2 max-w-md mx-auto">
              Supercharge your collecting experience and unlock the full potential of your vault.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {benefits.map((benefit, i) => (
              <div 
                key={i}
                className="p-4 bg-yellow-50/50 border-4 border-gray-800 rounded-2xl flex items-start gap-3 shadow-[3px_3px_0px_rgba(0,0,0,0.85)]"
              >
                <div className="bg-yellow-400 border-2 border-gray-800 rounded-lg p-1 shrink-0">
                  <CheckCircle className="w-4 h-4 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">{benefit.title}</h3>
                  <p className="text-gray-600 text-xs font-bold mt-0.5 leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Block */}
          <div className="bg-gray-50 border-4 border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_rgba(0,0,0,0.85)]">
            <div className="text-center md:text-left">
              <span className="bg-pink-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full border-2 border-gray-800 tracking-wider">
                ONE-TIME PAYMENT
              </span>
              <div className="flex items-baseline gap-1 justify-center md:justify-start mt-2">
                <span className="text-3xl font-black text-gray-800">$9.99</span>
                <span className="text-xs font-bold text-gray-500">lifetime access</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-1">
                Stripe test mode active. No actual cards will be charged.
              </p>
            </div>

            <motion.button
              onClick={handleUpgrade}
              disabled={loading || user?.isVIP}
              className="w-full md:w-auto px-8 h-12 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 border-4 border-gray-800 text-gray-900 font-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-2 transition-colors shrink-0 uppercase tracking-wider"
              whileHover={loading || user?.isVIP ? {} : { y: -1.5, boxShadow: '3px 4.5px 0px rgba(0,0,0,0.85)' }}
              whileTap={loading || user?.isVIP ? {} : { y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
            >
              <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {user?.isVIP ? 'Already a VIP!' : 'Upgrade to VIP'}
              {!loading && !user?.isVIP && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </PopArtBackground>
  );
}
