import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Sparkles, ArrowDownUp, TrendingUp, TrendingDown, Star, Crown, MessageCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import TradeModal from '@/components/TradeModal';
import CategoryBadge from '@/components/CategoryBadge';
import { useAuth } from '@/lib/AuthContext';
import { toast as hotToast } from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';
import { getConditionMultiplier, getConditionBadgeStyle } from '@/lib/conditionHelper';

const COLLECTORS = {
  1: { id: '1', name: 'Alex "PopKing" Rivera', badge: 'Grail Hunter', gradient: 'from-pink-500 to-rose-500', initials: 'AR' },
  2: { id: '2', name: 'Samantha Chase', badge: 'Disney Expert', gradient: 'from-cyan-500 to-blue-500', initials: 'SC' },
  3: { id: '3', name: 'Marcus "Vault" Thompson', badge: 'Legendary', gradient: 'from-purple-500 to-indigo-500', initials: 'MT' },
  4: { id: '4', name: 'Priya Sharma', badge: 'Rising Star', gradient: 'from-yellow-500 to-orange-500', initials: 'PS' },
  5: { id: '5', name: 'Jordan "Exclusives" Lee', badge: 'Exclusive Seeker', gradient: 'from-green-500 to-teal-500', initials: 'JL' },
  6: { id: '6', name: 'Casey Williams', badge: 'Spooky Collector', gradient: 'from-red-500 to-pink-500', initials: 'CW' },
};

const MOCK_COLLECTIONS = {
  1: [
    { id: 1, name: 'Iron Man (Mark 50)', series: 'Marvel', number: 285, marketValue: 120, purchasePrice: 15, rarity: 'Epic', isExclusive: true },
    { id: 2, name: 'Spider-Man (Symbiote)', series: 'Marvel', number: 362, marketValue: 85, purchasePrice: 12, rarity: 'Rare' },
    { id: 3, name: 'Thor (Endgame)', series: 'Marvel', number: 452, marketValue: 45, purchasePrice: 10, rarity: 'Common' },
    { id: 4, name: 'Thanos (Glow)', series: 'Marvel', number: 289, marketValue: 200, purchasePrice: 15, rarity: 'Legendary', isExclusive: true },
    { id: 5, name: 'Deadpool (Unmasked)', series: 'Marvel', number: 180, marketValue: 60, purchasePrice: 11, rarity: 'Uncommon' },
    { id: 6, name: 'Wolverine (Classic)', series: 'Marvel', number: 555, marketValue: 95, purchasePrice: 14, rarity: 'Epic' },
  ],
  2: [
    { id: 1, name: 'Mickey Mouse (Gold)', series: 'Disney', number: 1, marketValue: 350, purchasePrice: 15, rarity: 'Grail', isExclusive: true },
    { id: 2, name: 'Elsa (Frozen 2)', series: 'Disney', number: 595, marketValue: 30, purchasePrice: 10, rarity: 'Common' },
    { id: 3, name: 'Stitch (Aloha)', series: 'Disney', number: 1049, marketValue: 40, purchasePrice: 11, rarity: 'Uncommon' },
    { id: 4, name: 'Maleficent (Dragon)', series: 'Disney', number: 720, marketValue: 75, purchasePrice: 12, rarity: 'Rare' },
  ],
  3: [
    { id: 1, name: 'Darth Vader (Glow)', series: 'Star Wars', number: 68, marketValue: 220, purchasePrice: 15, rarity: 'Legendary', isExclusive: true },
    { id: 2, name: 'Yoda (Chrome)', series: 'Star Wars', number: 124, marketValue: 180, purchasePrice: 15, rarity: 'Epic', isExclusive: true },
    { id: 3, name: 'Boba Fett', series: 'Star Wars', number: 297, marketValue: 55, purchasePrice: 11, rarity: 'Rare' },
    { id: 4, name: 'Mandalorian', series: 'Star Wars', number: 345, marketValue: 40, purchasePrice: 10, rarity: 'Common' },
    { id: 5, name: 'Grogu (The Child)', series: 'Star Wars', number: 368, marketValue: 90, purchasePrice: 12, rarity: 'Epic' },
  ],
};

// Generate collection for others
for (let i = 4; i <= 6; i++) {
  MOCK_COLLECTIONS[i] = [
    { id: 1, name: 'Naruto Uzumaki', series: 'Anime', number: 185, marketValue: 35, purchasePrice: 10, rarity: 'Common' },
    { id: 2, name: 'Goku (Super Saiyan)', series: 'Anime', number: 186, marketValue: 65, purchasePrice: 11, rarity: 'Rare' },
    { id: 3, name: 'Batman (1989)', series: 'DC', number: 337, marketValue: 60, purchasePrice: 12, rarity: 'Uncommon' },
  ];
}

function PublicPopCard({ item, collectorName, collectorId, targetIsVipOrAdmin, isAlreadyInVault, index }) {
  const { user } = useAuth();
  const [tradeTarget, setTradeTarget] = useState(null);
  const [imgError, setImgError] = useState(false);
  const roi = item.marketValue && item.purchasePrice
    ? ((item.marketValue - item.purchasePrice) / item.purchasePrice * 100).toFixed(1)
    : 0;
  const isPositiveRoi = parseFloat(roi) >= 0;

  const currentIsVipOrAdmin = user?.isLoggedIn && (user?.isVIP || user?.role === 'vip' || user?.role === 'admin');
  const hasValidImage = Boolean(item.image && typeof item.image === 'string' && item.image.trim() !== '' && item.image !== 'null' && item.image !== 'undefined');

  return (
    <>
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, type: 'spring', bounce: 0.35 }}
      >
        <div className="absolute inset-0 bg-black/30 rounded-2xl translate-x-1 translate-y-1.5" />

      {(() => {
        const neonShadow = index % 2 === 0
          ? 'dark:shadow-[5px_5px_0px_#00AEEF] dark:hover:shadow-[7px_7px_0px_#00AEEF]'
          : 'dark:shadow-[5px_5px_0px_#EC008C] dark:hover:shadow-[7px_7px_0px_#EC008C]';
        return (
          <div className={`relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-800 dark:border-slate-600 ${neonShadow} shadow-[5px_5px_0px_rgba(0,0,0,0.85)] transition-all`}>
            {/* Top bar */}
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-lg">#{item.number}</span>
                {item.quantity > 1 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-400 text-gray-900 border border-gray-800 shadow-sm">
                    Qty: {item.quantity}
                  </span>
                )}
              </div>
              <CategoryBadge category={item.series} size="sm" />
            </div>

            {/* Image */}
            <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
              <div className="relative bg-white dark:bg-gray-950 rounded-xl p-2 border-4 border-gray-300 dark:border-slate-700 shadow-inner">
              {item.isExclusive && (
                <motion.div
                  className="absolute -top-2 -right-2 z-20"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3" fill="white" />
                    EXCLUSIVE
                  </div>
                </motion.div>
              )}
              {isAlreadyInVault && (
                <div className="absolute top-2 left-2 z-20">
                  <div className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] flex items-center gap-1">
                    <span>📦</span> Already in Vault
                  </div>
                </div>
              )}
              <div className="aspect-square bg-gradient-to-br from-cyan-50 to-pink-50 rounded-lg flex items-center justify-center">
                {hasValidImage && !imgError ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain"
                    onError={() => setImgError(true)} 
                  />
                ) : (
                  <Sparkles className="w-14 h-14 text-pink-300" />
                )}
              </div>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
              <CategoryBadge category={item.rarity} type="rarity" size="sm" />
              {item.boxCondition && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${getConditionBadgeStyle(item.boxCondition)}`}>
                  {item.boxCondition}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-800 px-4 py-2">
            <h3 className="text-white font-bold text-base truncate">{item.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-cyan-400 font-black text-lg">${(item.marketValue || 0).toFixed(0)}</p>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${isPositiveRoi ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isPositiveRoi ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositiveRoi ? '+' : ''}{roi}%
              </div>
            </div>
          </div>

          {/* Propose Trade button */}
          {user?.isLoggedIn && (
            <div className="px-3 py-3 bg-gray-800 border-t-2 border-gray-700">
              {!currentIsVipOrAdmin ? (
                <Link to="/vip-upgrade" className="block w-full">
                  <motion.button
                    className="w-full h-9 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 text-gray-900 font-black text-xs rounded-xl border-2 border-gray-600 shadow-[2px_2px_0px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1"
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    <Crown className="w-3.5 h-3.5 text-gray-900 fill-current" />
                    Upgrade to VIP to Trade
                  </motion.button>
                </Link>
              ) : !targetIsVipOrAdmin ? (
                <button
                  disabled
                  className="w-full h-9 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 font-black text-[10px] rounded-xl border-2 border-gray-405 cursor-not-allowed flex items-center justify-center"
                >
                  User is not VIP
                </button>
              ) : (
                <motion.button
                  onClick={() => setTradeTarget(item)}
                  className="w-full h-9 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-sm rounded-xl border-2 border-gray-600 shadow-[2px_2px_0px_rgba(0,0,0,0.6)] flex items-center justify-center gap-2"
                  whileHover={{ y: -1, boxShadow: '2px 4px 0px rgba(0,0,0,0.6)' }}
                  whileTap={{ y: 0, boxShadow: '1px 1px 0px rgba(0,0,0,0.6)' }}
                >
                  <ArrowDownUp className="w-3.5 h-3.5" />
                  Propose Trade
                </motion.button>
              )}
            </div>
          )}
        </div>
        );
      })()}
      </motion.div>

      {tradeTarget && (
        <TradeModal
          targetPop={tradeTarget}
          collectorName={collectorName}
          receiverId={collectorId}
          onClose={() => setTradeTarget(null)}
        />
      )}
    </>
  );
}

export default function PublicVault() {
  const [searchParams] = useSearchParams();
  const [collector, setCollector] = useState(null);
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tradeTarget, setTradeTarget] = useState(null);

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const collectorId = searchParams.get('id') || '1';

  // Load collector details and vault dynamically
  useEffect(() => {
    const isVipOrAdmin = currentUser?.isVIP || currentUser?.isVip || currentUser?.role === 'vip' || currentUser?.role === 'admin';
    if (currentUser?.isLoggedIn && !isVipOrAdmin) {
      hotToast.error('👑 VIP status is required to view collector vaults.');
      navigate('/vip-upgrade');
      return;
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(collectorId);

    if (isObjectId) {
      setLoading(true);
      fetch(getApiUrl(`/api/users/${collectorId}/profile`))
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setCollector({
              id: data.user._id,
              name: data.user.username,
              role: data.user.role,
              initials: data.user.username.slice(0, 2).toUpperCase(),
              gradient: data.user.role === 'admin'
                ? 'from-cyan-500 to-blue-500'
                : data.user.role === 'vip'
                  ? 'from-yellow-500 to-orange-500'
                  : 'from-gray-500 to-slate-655',
              badge: data.user.role.toUpperCase()
            });

            const mappedPops = data.vaultItems.map(item => {
              const catalog = item.pop || {};
              const marketVal = catalog.marketPrice || 25;
              return {
                id: catalog._id || item._id,
                popId: catalog._id || item._id,
                name: catalog.name || 'Unknown Pop',
                series: catalog.series || 'General',
                number: catalog.itemNumber || catalog.number || 0,
                image: catalog.imageUrl || catalog.image || '',
                marketValue: marketVal,
                purchasePrice: item.purchasePrice || 10,
                rarity: marketVal >= 100 ? 'Grail' : (marketVal > 25 ? 'Rare' : 'Common'),
                boxCondition: item.boxCondition || 'Mint (9.5-10)',
                quantity: item.quantity || 1
              };
            });

            setCollection(mappedPops);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('❌ Error fetching public profile:', err);
          setLoading(false);
        });
    } else {
      // Mock lookup fallback
      const mockId = parseInt(collectorId) || 1;
      const mockCollector = COLLECTORS[mockId] || COLLECTORS[1];
      setCollector(mockCollector);
      setCollection(MOCK_COLLECTIONS[mockId] || MOCK_COLLECTIONS[1]);
      setLoading(false);
    }
  }, [collectorId]);

  const [userVaultPopIds, setUserVaultPopIds] = useState(new Set());

  useEffect(() => {
    if (currentUser && currentUser.isLoggedIn) {
      fetch(getApiUrl('/api/vault'), {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const ids = new Set(data.map(item => String(item.pop?._id || item._id)));
            setUserVaultPopIds(ids);
          }
        })
        .catch(err => console.error('Error fetching user vault:', err));
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-black text-gray-500 animate-pulse">Loading Profile Vault...</p>
      </div>
    );
  }

  if (!collector) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-black text-red-500">Profile not found.</p>
      </div>
    );
  }

  const totalValue = collection.reduce((sum, item) => sum + (item.marketValue || 0), 0);

  const currentIsVipOrAdmin = currentUser?.isLoggedIn && (currentUser?.isVIP || currentUser?.role === 'vip' || currentUser?.role === 'admin');
  const targetIsVipOrAdmin = collector?.role === 'vip' || collector?.role === 'admin' || collector?.id === '1' || collector?.id === '2' || collector?.id === '3' || collector?.id === 1 || collector?.id === 2 || collector?.id === 3;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/CollectorSearch">
            <motion.div
              className="inline-flex items-center gap-2 bg-white border-4 border-gray-800 rounded-2xl px-4 py-2 font-black text-gray-700 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] hover:bg-gray-50"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </motion.div>
          </Link>
        </motion.div>

        {/* Collector Header */}
        <motion.div
          className="bg-white border-4 border-gray-800 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,0.85)] overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className={`h-3 bg-gradient-to-r ${collector.gradient || 'from-pink-500 to-rose-500'}`} />
          <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${collector.gradient || 'from-pink-500 to-rose-500'} border-4 border-gray-800 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,0.7)] text-white font-black text-2xl`}>
              {collector.initials}
            </div>
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-black text-gray-850">{collector.name}'s Vault</h1>
              <span className="inline-block bg-yellow-100 border-2 border-yellow-400 text-yellow-700 text-sm font-black px-3 py-0.5 rounded-full mt-1">
                ⭐ {collector.badge || 'Grail Hunter'}
              </span>
              <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 text-center">
                  <p className="text-xl font-black text-gray-800">{collection.length}</p>
                  <p className="text-xs font-bold text-gray-500">Pops</p>
                </div>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 text-center">
                  <p className="text-xl font-black text-cyan-500">${totalValue.toLocaleString()}</p>
                  <p className="text-xs font-bold text-gray-500">Total Value</p>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons Grid */}
            <div className="flex flex-col items-center md:items-end gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
              {!currentIsVipOrAdmin ? (
                <motion.button
                  onClick={() => navigate('/vip-upgrade')}
                  className="px-5 py-3 w-full md:w-auto justify-center bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 text-gray-900 font-black text-sm rounded-2xl border-4 border-gray-808 shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center gap-2"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Crown className="w-4 h-4 text-gray-900 animate-bounce" />
                  👑 Upgrade to VIP to Trade/Message
                </motion.button>
              ) : !targetIsVipOrAdmin ? (
                <div className="flex flex-col items-center md:items-end gap-1.5 w-full">
                  <div className="flex gap-2 w-full">
                    <button
                      disabled
                      className="flex-1 md:flex-none px-4 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 font-black text-xs rounded-xl border-4 border-gray-300 dark:border-gray-850 cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      Propose Trade
                    </button>
                    <button
                      disabled
                      className="flex-1 md:flex-none px-4 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 font-black text-xs rounded-xl border-4 border-gray-300 dark:border-gray-850 cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      Send Message
                    </button>
                  </div>
                  <p className="text-[10px] text-red-500 font-black text-center md:text-right">
                    ⚠️ Target user is not a VIP and cannot receive trades or messages.
                  </p>
                </div>
              ) : (
                <div className="flex gap-2 w-full md:w-auto">
                  <motion.button
                    onClick={() => {
                      if (collection.length > 0) {
                        setTradeTarget(collection[0]);
                      } else {
                        hotToast.error("This user doesn't have any items to trade!");
                      }
                    }}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xs rounded-xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-1.5"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <ArrowDownUp className="w-4 h-4" />
                    Propose Trade
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      const text = prompt(`Send a private message to ${collector?.name}:`);
                      if (text && text.trim()) {
                        fetch(getApiUrl('/api/messages/private'), {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentUser?.token}`
                          },
                          body: JSON.stringify({
                            receiverId: collector.id,
                            text
                          })
                        })
                          .then(res => res.json())
                          .then(data => {
                            if (data.error || data.message) {
                              hotToast.error(data.error || data.message);
                            } else {
                              hotToast.success(`Message sent to ${collector?.name}!`);
                            }
                          })
                          .catch(err => {
                            console.error(err);
                            hotToast.error('Failed to send private message.');
                          });
                      }
                    }}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-xs rounded-xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-1.5"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Collection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {collection.map((item, i) => (
            <PublicPopCard
              key={item.id}
              item={item}
              collectorName={collector.name}
              collectorId={collector.id}
              targetIsVipOrAdmin={targetIsVipOrAdmin}
              isAlreadyInVault={userVaultPopIds.has(String(item.popId || item.id))}
              index={i}
            />
          ))}
        </div>
      </div>

      {tradeTarget && (
        <TradeModal
          targetPop={tradeTarget}
          collectorName={collector.name}
          receiverId={collector.id}
          onClose={() => setTradeTarget(null)}
        />
      )}
    </div>
  );
}