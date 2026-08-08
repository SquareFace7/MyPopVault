import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Search, MessageCircle, Package, Star, Users, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { toast as hotToast } from 'react-hot-toast';
import PrivateChatModal from '@/components/PrivateChatModal';
import { getApiUrl } from '@/lib/api';

function CollectorCard({ collector, index, onMessage }) {
  const { user } = useAuth();
  const currentIsVipOrAdmin = user?.isVIP || user?.role === 'vip' || user?.role === 'admin';
  const targetIsVipOrAdmin = collector.role === 'vip' || collector.role === 'admin';

  return (
    <motion.div
      className="bg-white border-4 border-gray-800 rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,0.85)] overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4, boxShadow: '5px 9px 0px rgba(0,0,0,0.85)' }}
    >
      {/* Top color bar */}
      <div className={`h-2 bg-gradient-to-r ${collector.gradient}`} />

      <div className="p-5">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${collector.gradient} border-3 border-gray-800 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.6)]`}
            style={{ border: '3px solid #1f2937' }}>
            <span className="text-white font-black text-sm">{collector.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-black text-gray-805 text-sm truncate">{collector.name}</p>
            <span className="inline-block bg-cyan-100 border-2 border-cyan-400 text-cyan-700 text-xs font-black px-2 py-0.5 rounded-full">
              ⭐ {collector.badge}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-2 text-center">
            <p className="text-xl font-black text-gray-800">{collector.collectionSize}</p>
            <p className="text-xs font-bold text-gray-500">Pops</p>
          </div>
          <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-2 text-center">
            <p className="text-sm font-black text-gray-800 truncate">{collector.topSeries}</p>
            <p className="text-xs font-bold text-gray-500">Top Series</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link to={`/PublicVault?id=${collector.id}`} className="flex-1">
            <motion.div
              className="flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-xs rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]"
              whileHover={{ y: -1, boxShadow: '2px 4px 0px rgba(0,0,0,0.7)' }}
              whileTap={{ y: 0, boxShadow: '1px 1px 0px rgba(0,0,0,0.7)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              View Vault
            </motion.div>
          </Link>
          
          {!currentIsVipOrAdmin ? (
            <motion.button
              onClick={() => onMessage(collector)}
              className="flex-1 flex items-center justify-center gap-1 h-9 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black text-[9px] rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]"
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              👑 Upgrade to VIP
            </motion.button>
          ) : !targetIsVipOrAdmin ? (
            <button
              disabled
              title="This user is not a VIP and cannot receive trades or messages."
              className="flex-1 h-9 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-650 font-black text-[9px] rounded-xl border-2 border-gray-300 dark:border-gray-850 cursor-not-allowed flex items-center justify-center"
            >
              User is not VIP
            </button>
          ) : (
            <motion.button
              onClick={() => onMessage(collector)}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xs rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]"
              whileHover={{ y: -1, boxShadow: '2px 4px 0px rgba(0,0,0,0.7)' }}
              whileTap={{ y: 0, boxShadow: '1px 1px 0px rgba(0,0,0,0.7)' }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Message
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CollectorSearch() {
  const [query, setQuery] = useState('');
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatRecipient, setChatRecipient] = useState(null);

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch registered users on mount
  useEffect(() => {
    fetch(getApiUrl('/api/users/public'), {
      headers: {
        'Authorization': `Bearer ${currentUser?.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map(u => ({
          id: u._id,
          name: u.username,
          role: u.role,
          initials: u.username.slice(0, 2).toUpperCase(),
          collectionSize: u.collectionSize || 0,
          topSeries: u.role === 'admin' ? 'ALL' : 'Marvel',
          gradient: u.role === 'admin'
            ? 'from-cyan-500 to-blue-500'
            : u.role === 'vip'
              ? 'from-yellow-500 to-orange-500'
              : 'from-gray-500 to-slate-658',
          badge: u.role.toUpperCase()
        }));

        setCollectors(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error loading public collectors:', err);
        setLoading(false);
      });
  }, [currentUser]);

  const handleMessage = (target) => {
    const currentIsVipOrAdmin = currentUser?.isVIP || currentUser?.role === 'vip' || currentUser?.role === 'admin';
    if (!currentIsVipOrAdmin) {
      hotToast.error('👑 Please upgrade to VIP status to unlock private messaging.');
      return;
    }
    setChatRecipient(target);
  };

  const filtered = collectors.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.topSeries.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="px-4 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-400 px-4 py-1.5 rounded-full mb-3">
            <Radar className="w-4 h-4 text-cyan-600 animate-pulse" />
            <span className="text-sm font-black text-cyan-700">Collector Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-805">
            Collector <span className="text-pink-500">Search</span>
          </h1>
          <p className="text-gray-500 font-bold mt-1">Find fellow collectors, browse vaults, and send messages</p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-3 bg-white border-4 border-gray-800 rounded-2xl shadow-[5px_5px_0px_rgba(0,0,0,0.85)] px-4 py-3">
            <Search className="w-6 h-6 text-pink-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or series…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-lg font-bold text-gray-800 placeholder-gray-400 bg-transparent outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600 font-black text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Results count */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-black text-gray-500">
            {filtered.length} collector{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-lg font-black text-gray-500 animate-pulse">Loading collectors directory...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((collector, i) => (
                <CollectorCard
                  key={collector.id}
                  collector={collector}
                  index={i}
                  onMessage={handleMessage}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-5xl">🔍</span>
            <p className="text-xl font-black text-gray-500 mt-4">No collectors found matching "{query}"</p>
          </motion.div>
        )}
      </div>

      {/* Real-time Private Message Modal overlay */}
      {chatRecipient && (
        <PrivateChatModal
          recipientId={chatRecipient.id}
          recipientName={chatRecipient.name}
          onClose={() => setChatRecipient(null)}
        />
      )}
    </div>
  );
}
