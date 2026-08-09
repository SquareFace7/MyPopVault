import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownUp, Sparkles, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast as hotToast } from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';
import { getConditionMultiplier, getConditionBadgeStyle } from '@/lib/conditionHelper';

const rarityColors = {
  Common: 'bg-gray-100 text-gray-700 border-gray-300',
  Uncommon: 'bg-green-100 text-green-700 border-green-300',
  Rare: 'bg-blue-100 text-blue-700 border-blue-300',
  Epic: 'bg-purple-100 text-purple-700 border-purple-300',
  Legendary: 'bg-orange-100 text-orange-700 border-orange-300',
  Grail: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

export default function TradeModal({ targetPop, collectorName, receiverId, onClose }) {
  const [selectedId, setSelectedId] = useState(null);
  const [sent, setSent] = useState(false);
  const [myPops, setMyPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  // Load current user's vault items to offer
  useEffect(() => {
    fetch(getApiUrl('/api/vault'), {
      headers: {
        'Authorization': `Bearer ${currentUser?.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(item => {
          const catalog = item.pop || {};
          const basePrice = typeof catalog.marketPrice === 'number' ? catalog.marketPrice : (typeof catalog.marketValue === 'number' ? catalog.marketValue : 15);
          const multiplier = getConditionMultiplier(item.boxCondition);
          const mVal = basePrice * multiplier;
          return {
            id: catalog._id || item._id,
            name: catalog.name || 'Unknown Pop',
            series: catalog.series || 'General',
            number: catalog.itemNumber || catalog.number || '0',
            marketValue: mVal,
            image: catalog.imageUrl || catalog.image || '',
            rarity: mVal >= 100 ? 'Grail' : mVal > 25 ? 'Rare' : 'Common',
            boxCondition: item.boxCondition || 'Mint (9.5-10)'
          };
        });
        setMyPops(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching vault for trade modal:', err);
        setLoading(false);
      });
  }, [currentUser]);

  const handleSend = () => {
    if (!selectedId) return;

    // Build payload using MongoDB ObjectIds or mock ids
    fetch(getApiUrl('/api/trades'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser?.token}`
      },
      body: JSON.stringify({
        receiverId: receiverId,
        offeredPopId: selectedId,
        requestedPopId: targetPop.id
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error || data.message) {
          hotToast.error(data.error || data.message);
        } else {
          setSent(true);
          hotToast.success('Trade offer proposed successfully!');
          setTimeout(onClose, 2000);
        }
      })
      .catch(err => {
        console.error('❌ Propose Trade Error:', err);
        hotToast.error('Failed to submit trade proposal.');
      });
  };

  const selectedPop = myPops.find(p => p.id === selectedId);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-lg bg-white border-4 border-gray-805 rounded-3xl shadow-[10px_10px_0px_rgba(0,0,0,0.85)] overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-6 py-4 flex items-center justify-between border-b-4 border-gray-850">
            <div className="flex items-center gap-2">
              <ArrowDownUp className="w-5 h-5 text-white" />
              <span className="font-black text-white text-lg">Propose a Trade</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {sent ? (
            <motion.div
              className="flex flex-col items-center justify-center py-16 px-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
              <h3 className="text-2xl font-black text-gray-805">Trade Offer Sent!</h3>
              <p className="text-gray-500 font-bold mt-1 text-center">
                {collectorName} will be notified of your offer.
              </p>
            </motion.div>
          ) : (
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* YOU WANT section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-6 bg-pink-500 rounded-full" />
                  <span className="font-black text-gray-800 text-sm uppercase tracking-wide">You Want</span>
                </div>
                <div className="flex items-center gap-4 bg-pink-50 border-4 border-gray-800 rounded-2xl p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.7)]">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl border-2 border-gray-800 flex items-center justify-center shrink-0">
                    {targetPop.image ? (
                      <img src={targetPop.image} alt={targetPop.name} className="w-full h-full object-contain rounded-xl" />
                    ) : (
                      <Sparkles className="w-8 h-8 text-pink-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-black text-gray-800 text-base leading-tight">{targetPop.name}</p>
                      {myPops.some(p => String(p.id) === String(targetPop.id || targetPop.popId)) && (
                        <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-gray-900 shadow-sm">
                          📦 Already in Vault
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-550">#{targetPop.number} · {targetPop.series}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`inline-block text-xs font-black px-2 py-0.5 rounded-full border-2 ${rarityColors[targetPop.rarity] || rarityColors.Common}`}>
                        {targetPop.rarity}
                      </span>
                      {targetPop.boxCondition && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getConditionBadgeStyle(targetPop.boxCondition)}`}>
                          {targetPop.boxCondition}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs font-bold text-gray-400">Value</p>
                    <p className="text-xl font-black text-cyan-500">${(targetPop.marketValue || 0).toFixed(0)}</p>
                  </div>
                </div>
              </div>

              {/* Swap icon */}
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 bg-gray-800 rounded-2xl border-4 border-gray-800 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
                  <ArrowDownUp className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* OFFER FROM YOUR VAULT section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-6 bg-cyan-500 rounded-full" />
                  <span className="font-black text-gray-800 text-sm uppercase tracking-wide">Offer from Your Vault</span>
                  {selectedPop && (
                    <span className="ml-auto text-xs font-black text-green-600 bg-green-100 border border-green-300 px-2 py-0.5 rounded-full">
                      ✓ Selected
                    </span>
                  )}
                </div>

                {loading ? (
                  <p className="text-xs text-gray-400 font-bold italic py-4">Loading your collection...</p>
                ) : myPops.length === 0 ? (
                  <p className="text-xs text-red-500 font-black py-4">⚠️ You don't have any vaulted pops to offer. Add some to your vault first!</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1 border-2 border-dashed border-gray-200 rounded-2xl">
                    {myPops.map(pop => (
                      <motion.button
                        key={pop.id}
                        type="button"
                        onClick={() => setSelectedId(pop.id)}
                        className={`text-left p-3 rounded-2xl border-4 transition-colors ${
                          selectedId === pop.id
                            ? 'border-pink-500 bg-pink-50 shadow-[3px_3px_0px_rgba(236,72,153,0.5)]'
                            : 'border-gray-800 bg-white hover:bg-gray-50 shadow-[3px_3px_0px_rgba(0,0,0,0.7)]'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {pop.image ? (
                              <img src={pop.image} alt={pop.name} className="w-full h-full object-contain" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-cyan-500" />
                            )}
                          </div>
                          {selectedId === pop.id && (
                            <CheckCircle className="w-4 h-4 text-pink-500 ml-auto" />
                          )}
                        </div>
                        <p className="font-black text-gray-805 text-xs leading-tight truncate">{pop.name}</p>
                        <p className="text-xs text-gray-500 font-bold truncate">#{pop.number} · {pop.series}</p>
                        <p className="text-sm font-black text-cyan-500 mt-1">${(pop.marketValue || 0).toFixed(0)}</p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Send button */}
              <motion.button
                onClick={handleSend}
                disabled={!selectedId}
                className={`w-full h-14 rounded-2xl border-4 border-gray-800 font-black text-white text-lg flex items-center justify-center gap-2 transition-all ${
                  selectedId
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-[5px_5px_0px_rgba(0,0,0,0.85)] cursor-pointer'
                    : 'bg-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.4)] cursor-not-allowed opacity-60'
                }`}
                whileHover={selectedId ? { y: -2, boxShadow: '5px 8px 0px rgba(0,0,0,0.85)' } : {}}
                whileTap={selectedId ? { y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Send className="w-5 h-5" />
                {selectedId ? 'Send Trade Offer' : 'Select a Pop to Offer'}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}