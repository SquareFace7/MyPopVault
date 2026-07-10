import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowRight } from 'lucide-react';
import PopArtBackground from '@/components/PopArtBackground';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import confetti from 'canvas-confetti';

export default function VipSuccess() {
  const { checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    // Sync local context to get updated VIP status from backend
    const syncStatus = async () => {
      try {
        await checkUserAuth();
      } catch (err) {
        console.error('Failed to sync auth status:', err);
      } finally {
        setSyncing(false);
      }
    };

    syncStatus();

    // Celebratory confetti trigger
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FF8C00', '#FF1493']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FF8C00', '#FF1493']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [checkUserAuth]);

  return (
    <PopArtBackground className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8 bg-slate-50 dark:bg-gray-950 font-sans">
      <motion.div
        className="w-full max-w-md bg-white border-4 border-gray-800 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] overflow-hidden text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="h-2.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />
        
        <div className="px-6 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 border-4 border-gray-800 rounded-full shadow-[3px_3px_0px_rgba(0,0,0,0.85)] mb-4 animate-bounce">
            <Crown className="w-8 h-8 text-gray-900" />
          </div>

          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            You are now <span className="text-yellow-500">VIP Premium</span>!
          </h1>
          <p className="text-xs font-bold text-gray-500 mt-2 px-4 leading-relaxed">
            Welcome to the elite club, collector. Your account features have been successfully upgraded!
          </p>

          <div className="my-6 p-4 bg-yellow-50/50 border-4 border-gray-800 rounded-2xl inline-block max-w-xs mx-auto shadow-[3px_3px_0px_rgba(0,0,0,0.85)]">
            <ul className="text-left space-y-2 text-xs font-bold text-gray-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span>Infinite Vault Capacity</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span>Exclusive profile VIP Badge</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span>Private messaging access</span>
              </li>
            </ul>
          </div>

          <motion.button
            onClick={() => navigate('/Dashboard')}
            disabled={syncing}
            className="w-full h-11 bg-yellow-400 hover:bg-yellow-500 border-4 border-gray-800 text-gray-900 font-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm"
            whileHover={{ y: -1.5, boxShadow: '3px 4.5px 0px rgba(0,0,0,0.85)' }}
            whileTap={{ y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
          >
            {syncing ? 'Syncing Account...' : 'Go to Dashboard'}
            {!syncing && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </div>
      </motion.div>
    </PopArtBackground>
  );
}
