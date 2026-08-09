import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Star, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';

const CATEGORIES = ['All', 'Marvel', 'Anime', 'Star Wars', 'DC', 'Disney'];

const RARITY_STYLES = {
  'Common': 'border-gray-200 text-gray-700 bg-gray-50',
  'Uncommon': 'border-green-400 text-green-700 bg-green-50',
  'Rare': 'border-blue-400 text-blue-700 bg-blue-50',
  'Epic': 'border-purple-400 text-purple-700 bg-purple-50',
  'Legendary': 'border-orange-400 text-orange-700 bg-orange-50',
  'Grail': 'border-yellow-400 text-yellow-700 bg-yellow-50',
};

const GLOW_EFFECTS = {
  'Common': '',
  'Uncommon': 'hover:shadow-green-200/50',
  'Rare': 'hover:shadow-blue-200/50',
  'Epic': 'hover:shadow-purple-200/50',
  'Legendary': 'hover:shadow-orange-200/50',
  'Grail': 'hover:shadow-yellow-300/60',
};

export default function PopExplorer() {
  const [catalog, setCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [addedIds, setAddedIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Reset page to 1 on filter/search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeCategory]);

  // Load catalog dynamically from backend seeder database with search/paging
  useEffect(() => {
    setLoading(true);
    fetch(getApiUrl(`/api/catalog?search=${searchQuery}&category=${activeCategory}&page=${page}&limit=12`))
      .then(res => res.json())
      .then(data => {
        const mapped = (data.items || []).map(pop => ({
          id: pop._id,
          name: pop.name,
          series: pop.series,
          number: pop.itemNumber,
          rarity: pop.marketPrice >= 100 ? 'Grail' : pop.marketPrice > 25 ? 'Rare' : 'Common',
          isExclusive: pop.marketPrice > 50,
          price: pop.marketPrice || 15,
          image: pop.imageUrl || null
        }));
        setCatalog(mapped);
        setTotalPages(data.pages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Failed to fetch explorer catalog:', err);
        setLoading(false);
      });
  }, [searchQuery, activeCategory, page]);

  // Pre-load already vaulted Pop IDs to lock the add action
  useEffect(() => {
    if (user && user.isLoggedIn) {
      fetch(getApiUrl('/api/vault'), {
        headers: {
          'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`
        }
      })
        .then(res => {
          if (res.status === 401) {
            logout();
            toast.error('Session expired. Please log in again.');
            navigate('/Login');
            throw new Error('Unauthorized');
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            const ids = data.map(item => item.pop?._id || item.pop);
            setAddedIds(new Set(ids));
          }
        })
        .catch(err => console.error('Failed to pre-fetch vault items:', err));
    }
  }, [user]);

  const handleAdd = async (id) => {
    if (!user || !user.isLoggedIn) {
      toast.error('⚠️ Please log in or sign up to access this page!', {
        duration: 4000,
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      navigate('/Login');
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/vault'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ popId: id })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to add Pop to vault');
      }

      setAddedIds(prev => new Set([...prev, id]));
      toast.success('🎉 Added to your Personal Vault!', {
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
      toast.error(`⚠️ ${err.message || 'Could not add Pop.'}`, {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans transition-colors dark:bg-gray-955">
      <div className="max-w-7xl mx-auto">
        {/* Banner header */}
        <motion.div
          className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-8 rounded-3xl border-4 border-gray-800 dark:border-slate-600 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_#EC008C] mb-8 overflow-hidden"
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-48 h-48 text-white animate-pulse" />
          </div>
          <div className="relative z-10 max-w-lg">
            <span className="bg-yellow-400 text-gray-900 border-2 border-gray-800 px-3 py-1 rounded-full font-black text-xs uppercase tracking-widest inline-flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Zap className="w-3 h-3 fill-gray-900" />
              Database Catalog
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mt-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.85)]">
              Explore Pops
            </h1>
            <p className="text-white font-bold text-sm md:text-base mt-2 opacity-95">
              Browse our seeded database. Find and add items to your personal vault collection.
            </p>
          </div>
        </motion.div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border-4 border-gray-850 dark:border-slate-600 p-6 mb-8 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_#00AEEF] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 border-2 border-gray-200 rounded-2xl font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:border-pink-500 transition-colors dark:bg-gray-955 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Category Filters */}
          <div className="flex gap-2 flex-wrap justify-center w-full md:w-auto">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-colors border-2 ${
                  activeCategory === category
                    ? 'bg-gray-800 border-gray-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-250'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-lg font-black text-gray-500 animate-pulse">Loading catalog...</p>
          </div>
        ) : catalog.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-gray-400 rounded-3xl p-16 text-center max-w-lg mx-auto shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
            <span className="text-5xl">🔎</span>
            <h3 className="text-xl font-black text-gray-700 mt-4">No Pops Found</h3>
            <p className="text-gray-500 mt-1 font-bold text-sm">We couldn't find matches. Try adjusting your query or category filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {catalog.map((pop, i) => {
                  const neonShadow = i % 2 === 0
                    ? 'dark:shadow-[5px_5px_0px_#00AEEF] dark:hover:shadow-[7px_7px_0px_#00AEEF]'
                    : 'dark:shadow-[5px_5px_0px_#EC008C] dark:hover:shadow-[7px_7px_0px_#EC008C]';
                  return (
                    <motion.div
                      key={pop.id}
                      onClick={() => navigate(`/pop/${pop.id}`)}
                      className={`relative bg-white dark:bg-gray-900 border-4 border-gray-805 dark:border-slate-600 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] ${neonShadow} overflow-hidden flex flex-col justify-between transition-all cursor-pointer ${GLOW_EFFECTS[pop.rarity] || ''}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      whileHover={{ y: -4 }}
                    >
                    <div>
                      {/* Header */}
                      <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between text-white text-xs font-black">
                        <span className="uppercase tracking-widest text-cyan-400">{pop.series}</span>
                        <span>#{pop.number}</span>
                      </div>

                      {/* Window Image Box */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 w-full h-48 flex items-center justify-center relative p-3 border-b-4 border-gray-800 dark:border-slate-600">
                        {/* Rarity Ribbon */}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded border-2 text-[9px] font-black uppercase tracking-wider ${RARITY_STYLES[pop.rarity]} z-10 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]`}>
                          {pop.rarity}
                        </span>

                        {pop.image ? (
                          <img src={pop.image} alt={pop.name} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <Sparkles className="w-10 h-10 text-cyan-300 animate-pulse" />
                        )}
                      </div>

                      {/* Title Footer */}
                      <div className="p-4">
                        <h2 className="font-black text-base text-gray-855 dark:text-white truncate">{pop.name}</h2>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-gray-400 text-xs font-bold">Catalog Record</p>
                          <p className="text-sm font-black text-cyan-600">${pop.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Add Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(pop.id);
                      }}
                      disabled={addedIds.has(pop.id)}
                      className={`w-full py-3 font-black text-xs border-t-4 border-gray-800 dark:border-slate-600 tracking-wider uppercase ${
                        addedIds.has(pop.id)
                          ? 'bg-green-400 text-white cursor-default'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      }`}
                      whileHover={addedIds.has(pop.id) ? {} : { filter: 'brightness(1.08)' }}
                      whileTap={addedIds.has(pop.id) ? {} : { scale: 0.98 }}
                    >
                      {addedIds.has(pop.id) ? '✓ Added to Vault' : 'Add to Vault'}
                    </motion.button>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-12">
                <motion.button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-4 border-gray-800 rounded-2xl font-black text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.85)] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={page === 1 ? {} : { y: -1 }}
                  whileTap={page === 1 ? {} : { scale: 0.98 }}
                >
                  Previous
                </motion.button>
                <span className="font-black text-sm text-gray-800 dark:text-white">
                  Page {page} of {totalPages}
                </span>
                <motion.button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-4 border-gray-800 rounded-2xl font-black text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.85)] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={page === totalPages ? {} : { y: -1 }}
                  whileTap={page === totalPages ? {} : { scale: 0.98 }}
                >
                  Next
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}