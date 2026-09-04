import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Star, TrendingUp, Package, Tag, ShieldCheck, DollarSign } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';
import AddToVaultModal from '@/components/AddToVaultModal';
import CategoryBadge from '@/components/CategoryBadge';
import { getConditionBadgeStyle } from '@/lib/conditionHelper';

export default function PopDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pop, setPop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [userVaultItem, setUserVaultItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    // Fetch pop catalog detail by ID
    fetch(getApiUrl(`/api/catalog/${id}`))
      .then(res => {
        if (!res.ok) throw new Error('Failed to load Pop catalog details.');
        return res.json();
      })
      .then(data => {
        setPop(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('❌ Could not retrieve Pop details.');
        setLoading(false);
      });

    // Check if user already owns this item
    if (user && user.isLoggedIn) {
      fetch(getApiUrl('/api/vault'), {
        headers: {
          'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const ownedItem = data.find(item => (item.pop?._id || item.pop) === id);
            if (ownedItem) {
              setAdded(true);
              setUserVaultItem({
                purchasePrice: typeof ownedItem.purchasePrice === 'number' ? ownedItem.purchasePrice : 0,
                boxCondition: ownedItem.boxCondition || 'Mint (9.5-10)',
                quantity: ownedItem.quantity || 1
              });
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, [id, user]);

  const handleInitiateAdd = () => {
    if (!user || !user.isLoggedIn) {
      toast.error('⚠️ Please log in to add items.');
      navigate('/Login');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmAddToVault = async ({ popId, purchasePrice, boxCondition, quantity }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl('/api/vault'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ popId, purchasePrice, boxCondition, quantity })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to add Pop');
      }

      setAdded(true);
      setUserVaultItem({
        purchasePrice: typeof purchasePrice === 'number' ? purchasePrice : parseFloat(purchasePrice) || 0,
        boxCondition: boxCondition || 'Mint (9.5-10)',
        quantity: parseInt(quantity, 10) || 1
      });
      setIsModalOpen(false);
      toast.success('🎉 Successfully added to your personal vault!');
    } catch (err) {
      console.error(err);
      toast.error(`⚠️ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-xl font-black text-pink-500 animate-pulse uppercase tracking-widest">
          Loading Pop Details...
        </p>
      </div>
    );
  }

  if (!pop) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center p-6">
        <span className="text-6xl mb-4">👽</span>
        <h2 className="text-2xl font-black text-white uppercase mb-4">Pop Not Found</h2>
        <button
          onClick={() => navigate('/PopExplorer')}
          className="px-6 py-3 bg-gray-800 text-white border-4 border-gray-700 rounded-2xl font-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
        >
          Back to Explorer
        </button>
      </div>
    );
  }

  const isGrail = (pop.marketPrice || pop.price || 0) >= 10.49;
  const itemRarity = pop.rarity || ((pop.marketPrice || pop.price || 0) >= 10.49 ? 'Grail' : (pop.marketPrice || pop.price || 0) > 25 ? 'Rare' : 'Common');

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-4 border-gray-808 border-gray-800 text-gray-300 rounded-2xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,0.85)] mb-8 transition-colors hover:text-white"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4 text-pink-500" />
          Back
        </motion.button>

        {/* Content Card */}
        <div className="grid md:grid-cols-2 gap-8 bg-gray-900 border-4 border-gray-800 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.85)]">
          {/* Pop Image Column */}
          <div className="flex flex-col items-center justify-center bg-gray-950 border-4 border-gray-800 rounded-2xl p-6 relative aspect-square overflow-hidden shadow-inner">
            {isGrail && (
              <span className="absolute top-3 left-3 bg-yellow-400 text-gray-900 border-2 border-gray-800 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] z-10 animate-pulse">
                👑 GRAIL
              </span>
            )}
            
            {pop.imageUrl ? (
              <img
                src={pop.imageUrl}
                alt={pop.name}
                className="w-full h-full object-contain max-h-[300px] hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Sparkles className="w-20 h-20 text-cyan-400 animate-pulse" />
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between py-2">
            <div>
              {/* Badges bar (Series, Item #, Rarity, Box Condition) */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {pop.series}
                </span>
                <span className="bg-gray-800 border-2 border-gray-700 text-gray-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  #{pop.itemNumber || pop.number || '0'}
                </span>
                <CategoryBadge category={itemRarity} type="rarity" size="sm" />
                {userVaultItem?.boxCondition && (
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-sm ${getConditionBadgeStyle(userVaultItem.boxCondition)}`}>
                    {userVaultItem.boxCondition}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight text-white mb-4">
                {pop.name}
              </h1>

              <hr className="border-gray-800 my-4" />

              {/* Stats Block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-950 border-2 border-gray-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400 font-bold text-xs">Market Value</span>
                  </div>
                  <span className="text-2xl font-black text-green-400">
                    ${(pop.marketPrice || pop.price || 0).toFixed(2)}
                  </span>
                </div>

                {added && userVaultItem && (
                  <div className="flex items-center justify-between p-3 bg-cyan-950/40 border-2 border-cyan-500/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-cyan-400 font-black text-xs uppercase">Your Purchase Price</p>
                        <p className="text-[10px] text-gray-400 font-bold">Recorded in Vault</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-cyan-300">
                        ${userVaultItem.purchasePrice.toFixed(2)}
                      </span>
                      {(pop.marketPrice || pop.price || 0) > 0 && userVaultItem.purchasePrice > 0 && (
                        <p className={`text-[10px] font-black ${
                          (pop.marketPrice || pop.price || 0) >= userVaultItem.purchasePrice ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {(pop.marketPrice || pop.price || 0) >= userVaultItem.purchasePrice ? '+' : ''}
                          {((((pop.marketPrice || pop.price || 0) - userVaultItem.purchasePrice) / userVaultItem.purchasePrice) * 100).toFixed(1)}% ROI
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-950 border-2 border-gray-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-pink-400" />
                    <span className="text-gray-400 font-bold text-xs">Authentication</span>
                  </div>
                  <span className="text-xs font-black text-pink-400 uppercase tracking-widest">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8">
              {added ? (
                <div className="w-full py-4 bg-green-500/20 border-3 border-green-500 text-green-400 text-center font-black text-xs uppercase tracking-wider rounded-2xl shadow-inner">
                  ✓ Owned in Personal Vault
                </div>
              ) : (
                <motion.button
                  onClick={handleInitiateAdd}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-4 border-gray-800 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  whileHover={{ y: -2, boxShadow: '4px 6px 0px rgba(0,0,0,1)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add to Vault
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddToVaultModal
        pop={pop}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAddToVault}
        isLoading={isSubmitting}
      />
    </div>
  );
}
