import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Package, Sparkles, Trash2, Edit } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import { BOX_CONDITIONS, getConditionBadgeStyle } from '@/lib/conditionHelper';

export default function PopDetailModal({ item, isOpen, onClose, onDelete, onEdit }) {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(item.purchasePrice || 0);
  const [editCondition, setEditCondition] = useState(item.boxCondition || 'Mint (9.5-10)');
  const [editQuantity, setEditQuantity] = useState(item.quantity || 1);

  // Synchronize internal state when the active item changes
  useEffect(() => {
    if (item) {
      setEditPrice(item.purchasePrice || 0);
      setEditCondition(item.boxCondition || 'Mint (9.5-10)');
      setEditQuantity(item.quantity || 1);
      setIsEditing(false);
    }
  }, [item]);

  const roi = item.marketValue && item.purchasePrice 
    ? ((item.marketValue - item.purchasePrice) / item.purchasePrice * 100).toFixed(1)
    : 0;
  const isPositiveRoi = parseFloat(roi) >= 0;
  const profit = (item.marketValue || 0) - (item.purchasePrice || 0);

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

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800"
            initial={{ scale: 0.8, y: 50, rotateX: -15 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, y: 50, rotateX: -15 }}
            transition={{ type: "spring", bounce: 0.3 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-lg border-2 border-gray-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative w-full md:w-1/2 bg-gradient-to-br from-cyan-100 via-pink-100 to-yellow-100 p-8 flex flex-col justify-between">
                {/* Floating decorations */}
                <motion.div
                  className="absolute top-4 left-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" aria-hidden="true" />
                </motion.div>

                {/* Number Badge */}
                <div className="absolute top-4 right-14 bg-gray-800 text-white font-black px-4 py-2 rounded-full border-2 border-white">
                  #{item.number}
                </div>

                {/* Exclusive Badge */}
                {item.isExclusive && (
                  <motion.div
                    className="absolute top-16 right-4"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-gray-800">
                      ⭐ EXCLUSIVE
                    </div>
                  </motion.div>
                )}

                {/* Image */}
                <motion.div
                  className="aspect-square flex items-center justify-center my-6"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-white rounded-2xl border-4 border-gray-300 shadow-inner flex items-center justify-center">
                      <Package className="w-20 h-20 text-pink-300" />
                    </div>
                  )}
                </motion.div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <CategoryBadge category={item.series} />
                  <CategoryBadge category={item.rarity} type="rarity" />
                </div>
              </div>

              {/* Info Section */}
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-between border-t-4 md:border-t-0 md:border-l-4 border-gray-800">
                <div>
                  <span className="bg-cyan-100 text-cyan-800 border-2 border-cyan-400 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                    Personal Vault
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-800 mt-2 mb-1 leading-tight">{item.name}</h2>
                  <p className="text-gray-400 text-sm font-bold mb-6">{item.series} Collection Series</p>

                  {isEditing ? (
                    /* Edit Form Layout */
                    <div key="edit-mode" className="space-y-4 mb-6">
                      <div>
                        <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase">Purchase Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editPrice}
                          onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                          className="w-full h-11 px-4 border-4 border-gray-850 rounded-2xl font-bold text-sm bg-gray-50 focus:bg-white focus:border-cyan-500 focus:outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase">Box Condition</label>
                        <select
                          value={editCondition}
                          onChange={e => setEditCondition(e.target.value)}
                          className="w-full h-11 px-4 border-4 border-gray-850 rounded-2xl font-bold text-sm bg-gray-50 focus:bg-white focus:border-cyan-500 focus:outline-none transition-all"
                        >
                          {BOX_CONDITIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={editQuantity}
                          onChange={e => setEditQuantity(parseInt(e.target.value) || 1)}
                          className="w-full h-11 px-4 border-4 border-gray-850 rounded-2xl font-bold text-sm bg-gray-50 focus:bg-white focus:border-cyan-500 focus:outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    /* View Mode Layout */
                    <div key="view-mode" className="space-y-4">
                      {/* Price Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 p-4 border-2 border-green-300 dark:border-green-900/60 rounded-2xl">
                          <p className="text-[10px] text-green-700 dark:text-green-400 uppercase font-black">Paid Price</p>
                          <p className="text-xl font-black text-gray-800 dark:text-gray-100 mt-0.5">${(item.purchasePrice || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950/30 dark:to-blue-950/30 p-4 border-2 border-cyan-300 dark:border-cyan-900/60 rounded-2xl">
                          <p className="text-[10px] text-cyan-700 dark:text-cyan-400 uppercase font-black">Market Value</p>
                          <p className="text-xl font-black text-cyan-600 dark:text-cyan-300 mt-0.5">${(item.marketValue || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Attributes */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-950/30 p-4 border-2 border-purple-300 dark:border-purple-900/60 rounded-2xl">
                          <p className="text-[10px] text-purple-700 dark:text-purple-400 uppercase font-black mb-1">Condition</p>
                          <span className={`inline-block font-black text-xs px-2.5 py-1 rounded-lg border ${getConditionBadgeStyle(item.boxCondition)}`}>
                            {item.boxCondition || 'Mint (9.5-10)'}
                          </span>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-950/30 p-4 border-2 border-yellow-300 dark:border-yellow-900/60 rounded-2xl">
                          <p className="text-[10px] text-yellow-700 dark:text-yellow-400 uppercase font-black">Quantity Owned</p>
                          <p className="text-base font-black text-yellow-800 dark:text-yellow-305 mt-0.5">{item.quantity || 1} units</p>
                        </div>
                      </div>

                      {/* ROI Display */}
                      <motion.div
                        key="roi-display"
                        className={`p-4 border-2 rounded-2xl mb-6 ${
                          isPositiveRoi 
                            ? 'bg-green-50/50 border-green-200' 
                            : 'bg-red-50/50 border-red-200'
                        }`}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase">Return on Investment</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isPositiveRoi ? (
                                <TrendingUp className="w-5 h-5 text-green-500" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                              )}
                              <span className={`text-2xl font-black ${
                                isPositiveRoi ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isPositiveRoi ? '+' : ''}{roi}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-black uppercase">Profit Margin</p>
                            <p className={`text-lg font-black mt-0.5 ${
                              isPositiveRoi ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isPositiveRoi ? '+' : ''}${profit.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Actions Button Bar */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-150">
                  {isEditing ? (
                    <div key="edit-actions" className="flex gap-3 w-full">
                      <BouncyButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onEdit && onEdit(item.id, {
                            purchasePrice: editPrice,
                            boxCondition: editCondition,
                            quantity: editQuantity
                          });
                          setIsEditing(false);
                        }}
                        className="flex-1"
                      >
                        Save Changes
                      </BouncyButton>
                      <BouncyButton
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        Cancel
                      </BouncyButton>
                    </div>
                  ) : (
                    <div key="view-actions" className="flex gap-3 w-full">
                      <BouncyButton
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => setIsEditing(true)}
                        className="flex-1"
                      >
                        Edit
                      </BouncyButton>
                      <BouncyButton
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => onDelete && onDelete(item)}
                        className="text-red-500 hover:bg-red-50 border-2 border-red-200"
                      >
                        Delete
                      </BouncyButton>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}