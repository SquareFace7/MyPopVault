import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import PopArtBackground from '@/components/PopArtBackground';
import { useNavigate } from 'react-router-dom';

export default function VipCancel() {
  const navigate = useNavigate();

  return (
    <PopArtBackground className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8 bg-slate-50 dark:bg-gray-950 font-sans">
      <motion.div
        className="w-full max-w-md bg-white border-4 border-gray-800 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] overflow-hidden text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="h-2.5 w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500" />
        
        <div className="px-6 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 border-4 border-gray-800 rounded-full shadow-[3px_3px_0px_rgba(0,0,0,0.85)] mb-4">
            <XCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
          </div>

          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Checkout Cancelled
          </h1>
          <p className="text-xs font-bold text-gray-500 mt-2 px-4 leading-relaxed">
            Your payment session was cancelled. No charges were made to your card. You can try upgrading again whenever you're ready!
          </p>

          <motion.button
            onClick={() => navigate('/vip-upgrade')}
            className="w-full h-11 bg-gray-800 hover:bg-gray-950 border-4 border-gray-800 text-white font-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm mt-6"
            whileHover={{ y: -1.5, boxShadow: '3px 4.5px 0px rgba(0,0,0,0.85)' }}
            whileTap={{ y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Try Again
          </motion.button>
        </div>
      </motion.div>
    </PopArtBackground>
  );
}
