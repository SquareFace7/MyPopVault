import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, PlusCircle, DollarSign, Package } from 'lucide-react';
import { BOX_CONDITIONS } from '@/lib/conditionHelper';
import BouncyButton from './BouncyButton';

export default function AddToVaultModal({ pop, isOpen, onClose, onConfirm, isLoading }) {
  if (!pop) return null;

  const defaultPrice = typeof pop.marketPrice === 'number' ? pop.marketPrice : (typeof pop.marketValue === 'number' ? pop.marketValue : 15);
  
  const [purchasePrice, setPurchasePrice] = useState(defaultPrice);
  const [boxCondition, setBoxCondition] = useState('Mint (9.5-10)');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (pop) {
      const p = typeof pop.marketPrice === 'number' ? pop.marketPrice : (typeof pop.marketValue === 'number' ? pop.marketValue : 15);
      setPurchasePrice(p);
      setBoxCondition('Mint (9.5-10)');
      setQuantity(1);
    }
  }, [pop]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      popId: pop._id || pop.id,
      purchasePrice: parseFloat(purchasePrice) || 0,
      boxCondition,
      quantity: parseInt(quantity) || 1
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 dark:border-slate-600 z-10"
            initial={{ scale: 0.85, y: 30, rotateX: -10 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-6 py-4 flex items-center justify-between border-b-4 border-gray-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-white" />
                <h2 className="text-xl font-black text-white uppercase tracking-wide">Add Pop to Vault</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center border-2 border-white/40 transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pop Preview */}
            <div className="p-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border-2 border-gray-200 dark:border-gray-700 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {pop.imageUrl || pop.image ? (
                    <img src={pop.imageUrl || pop.image} alt={pop.name} className="w-full h-full object-contain" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-pink-400" />
                  )}
                </div>
                <div>
                  <p className="text-base font-black text-gray-800 dark:text-white leading-tight">{pop.name}</p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">#{pop.itemNumber || pop.number || '0'} · {pop.series}</p>
                  <p className="text-xs font-black text-cyan-600 dark:text-cyan-400 mt-1">Market Price: ${defaultPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Configuration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    Box Condition
                  </label>
                  <select
                    value={boxCondition}
                    onChange={(e) => setBoxCondition(e.target.value)}
                    className="w-full h-12 px-4 bg-white dark:bg-gray-800 border-4 border-gray-800 dark:border-slate-600 rounded-2xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
                  >
                    {BOX_CONDITIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full h-12 px-4 bg-white dark:bg-gray-800 border-4 border-gray-800 dark:border-slate-600 rounded-2xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
                    required
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-black text-sm rounded-2xl border-4 border-gray-800 dark:border-slate-600 shadow-[3px_3px_0px_rgba(0,0,0,0.7)] transition-all"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-black text-sm rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-2"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" /> Confirm Add
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
