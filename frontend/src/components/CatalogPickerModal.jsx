import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, X, Sparkles, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import AddToVaultModal from '@/components/AddToVaultModal';
import { getRarityFromPrice, RARITY_BADGE_STYLES } from '@/lib/rarityHelper';

const SERIES_LIST = ['All', 'Marvel', 'Anime', 'Star Wars', 'DC', 'Disney', 'Movies', 'Television', 'General'];

const BADGE_STYLES = {
  'NEW': 'bg-blue-500 text-white',
  'WEB EXCLUSIVE': 'bg-yellow-400 text-gray-900',
  'CHASE': 'bg-pink-500 text-white',
  'GRAIL': 'bg-yellow-400 text-gray-900 font-black border-yellow-600'
};

function CatalogItemImage({ src, alt }) {
  const [imgError, setImgError] = useState(false);
  if (src && !imgError) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain" 
        onError={() => setImgError(true)}
      />
    );
  }
  return <span className="text-4xl">✨</span>;
}

export default function CatalogPickerModal({ isOpen, onClose, onAdd }) {
  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState('');
  const [activeSeries, setActiveSeries] = useState('All');
  const [favorites, setFavorites] = useState(new Set());
  const [addedIds, setAddedIds] = useState(new Set());
  const [selectedPopForVault, setSelectedPopForVault] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch(getApiUrl('/api/catalog?limit=1000'))
        .then(res => res.json())
        .then(data => {
          const mapped = (data.items || []).map((pop, index) => {
            const computedRarity = getRarityFromPrice(pop.marketPrice, pop.rarity);
            return {
              id: pop._id,
              name: pop.name,
              series: pop.series,
              number: pop.itemNumber,
              rarity: computedRarity,
              image: pop.imageUrl || null,
              price: pop.marketPrice || 15,
              badge: null,
              color: pop.series === 'Marvel' ? 'from-red-105 to-orange-105' : 'from-blue-105 to-cyan-105'
            };
          });
          setCatalog(mapped);
        })
        .catch(err => console.error('Failed to fetch catalog:', err));
    }
  }, [isOpen]);

  const results = useMemo(() => {
    return catalog.filter(p => {
      const matchesSeries = activeSeries === 'All' || p.series === activeSeries;
      const matchesQuery = !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.series.toLowerCase().includes(query.toLowerCase()) ||
        String(p.number).toLowerCase().includes(query.toLowerCase());
      return matchesSeries && matchesQuery;
    });
  }, [catalog, query, activeSeries]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleInitiateAdd = (pop) => {
    setSelectedPopForVault(pop);
  };

  const handleConfirmAdd = ({ popId, purchasePrice, boxCondition, quantity }) => {
    if (!selectedPopForVault) return;
    setAddedIds(prev => new Set([...prev, selectedPopForVault.id]));
    onAdd({
      name: selectedPopForVault.name,
      series: selectedPopForVault.series,
      number: selectedPopForVault.number,
      rarity: selectedPopForVault.rarity,
      purchasePrice: typeof purchasePrice === 'number' ? purchasePrice : parseFloat(purchasePrice) || 0,
      marketValue: selectedPopForVault.price,
      condition: boxCondition,
      boxCondition: boxCondition,
      quantity: typeof quantity === 'number' && quantity > 0 ? quantity : parseInt(quantity) || 1,
      isExclusive: selectedPopForVault.badge === 'WEB EXCLUSIVE',
      popId: selectedPopForVault.id,
    });
    setSelectedPopForVault(null);
  };

  const handleClose = () => {
    setQuery('');
    setActiveSeries('All');
    setAddedIds(new Set());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-gray-100 pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full w-full flex flex-col"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="bg-white border-b-4 border-gray-800 shrink-0 z-20 relative">
              {/* Top-Right Absolute Close Button */}
              <motion.button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 md:top-5 md:right-8 z-50 p-2.5 bg-gray-900 text-white hover:bg-pink-600 border-2 border-gray-900 rounded-xl shadow-[3px_3px_0px_rgba(236,0,140,0.9)] cursor-pointer flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 stroke-[3]" />
              </motion.button>

              <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 pr-16 md:pr-24">
                <div className="flex items-center gap-3 mb-4">
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-black text-xs rounded-xl border-2 border-gray-900 shadow-[3px_3px_0px_rgba(236,0,140,0.9)] flex items-center gap-2 cursor-pointer z-30 relative shrink-0"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4 text-cyan-400 stroke-[3]" />
                    <span>Back to Vault</span>
                  </motion.button>
                  <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-pink-500" />
                    Catalog Picker
                  </h2>
                </div>

                {/* Search bar */}
                <div className="flex items-center gap-3 bg-gray-50 border-4 border-gray-800 rounded-2xl px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.7)] mb-4">
                  <Search className="w-5 h-5 text-pink-500 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search the global catalog..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-gray-800 font-bold text-sm placeholder-gray-400 outline-none"
                  />
                </div>

                {/* Series filters */}
                <div className="flex gap-2 flex-wrap">
                  {SERIES_LIST.map(series => (
                    <button
                      key={series}
                      onClick={() => setActiveSeries(series)}
                      className={`px-4 py-1.5 rounded-full font-black text-xs border-2 border-gray-800 transition-colors ${
                        activeSeries === series
                          ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                          : 'bg-white text-gray-600'
                      }`}
                    >
                      {series}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                {results.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-5xl mb-3">🔍</p>
                    <p className="font-black text-gray-400 text-lg">No Pops found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {results.map((pop, i) => (
                      <motion.div
                        key={pop.id}
                        className="relative bg-white border-4 border-gray-800 rounded-2xl shadow-[5px_5px_0px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        whileHover={{ y: -4, boxShadow: '5px 9px 0px rgba(0,0,0,0.8)' }}
                      >
                        {/* Top Badges (Ribbon & Standard Rarity) */}
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                          {pop.badge && pop.badge !== 'GRAIL' && (
                            <div className={`px-2 py-0.5 rounded-lg border-2 border-gray-800 font-black text-[9px] tracking-wide shadow-[2px_2px_0px_rgba(0,0,0,0.7)] ${BADGE_STYLES[pop.badge]}`}>
                              {pop.badge}
                            </div>
                          )}
                          <span className={`px-2 py-0.5 rounded-full border-2 text-[9px] font-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] ${RARITY_BADGE_STYLES[pop.rarity] || RARITY_BADGE_STYLES.Common}`}>
                            {pop.rarity}
                          </span>
                        </div>

                        {/* Heart icon */}
                        <motion.button
                          onClick={() => toggleFavorite(pop.id)}
                          className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 border-2 border-gray-800 rounded-full flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.7)]"
                          whileTap={{ scale: 0.85 }}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${favorites.has(pop.id) ? 'text-pink-500' : 'text-gray-400'}`}
                            fill={favorites.has(pop.id) ? '#ec4899' : 'none'}
                          />
                        </motion.button>

                        {/* Image area */}
                        <div className={`aspect-square bg-gradient-to-br ${pop.color} flex items-center justify-center border-b-4 border-gray-800 p-3 overflow-hidden`}>
                          <CatalogItemImage src={pop.image} alt={pop.name} />
                        </div>

                        {/* Info */}
                        <div className="p-3 flex-1 flex flex-col">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{pop.series}</p>
                          <p className="font-black text-gray-800 text-sm leading-tight mt-0.5 line-clamp-2">{pop.name}</p>
                          <p className="font-black text-cyan-600 text-sm mt-1">${pop.price.toFixed(2)}</p>
                        </div>

                        {/* Add button */}
                        <motion.button
                          onClick={() => handleInitiateAdd(pop)}
                          disabled={addedIds.has(pop.id)}
                          className={`w-full py-2.5 font-black text-xs border-t-4 border-gray-800 ${
                            addedIds.has(pop.id)
                              ? 'bg-green-400 text-white'
                              : 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
                          }`}
                          whileHover={addedIds.has(pop.id) ? {} : { filter: 'brightness(1.1)' }}
                          whileTap={addedIds.has(pop.id) ? {} : { scale: 0.98 }}
                        >
                          {addedIds.has(pop.id) ? '✓ ADDED!' : 'ADD TO VAULT'}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <AddToVaultModal
            pop={selectedPopForVault}
            isOpen={!!selectedPopForVault}
            onClose={() => setSelectedPopForVault(null)}
            onConfirm={handleConfirmAdd}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}