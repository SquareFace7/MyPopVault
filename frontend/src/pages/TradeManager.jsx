import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Check, X, Clock, Sparkles, Star, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import BouncyButton from '@/components/BouncyButton';
import { toast as hotToast } from 'react-hot-toast';
import PrivateChatModal from '@/components/PrivateChatModal';
import { getApiUrl } from '@/lib/api';
import { getConditionBadgeStyle } from '@/lib/conditionHelper';

const rarityColors = {
  Common: 'bg-gray-100 text-gray-700 border-gray-300',
  Uncommon: 'bg-green-100 text-green-700 border-green-300',
  Rare: 'bg-blue-100 text-blue-700 border-blue-300',
  Epic: 'bg-purple-100 text-purple-700 border-blue-300',
  Legendary: 'bg-orange-100 text-orange-700 border-orange-300',
  Grail: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

const statusConfig = {
  pending: { label: 'PENDING', bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-605', icon: Clock },
  accepted: { label: 'ACCEPTED!', bg: 'bg-green-550', text: 'text-white', border: 'border-green-700', icon: Check },
  rejected: { label: 'REJECTED', bg: 'bg-red-550', text: 'text-white', border: 'border-red-700', icon: X },
  canceled: { label: 'CANCELED', bg: 'bg-gray-400', text: 'text-white', border: 'border-gray-600', icon: X },
};

const parseItem = (item) => {
  if (!item) {
    return {
      name: 'Unknown Pop',
      series: 'General',
      number: '0',
      image: '',
      marketValue: 15,
      rarity: 'Common',
      boxCondition: 'Mint (9.5-10)',
      quantity: 1
    };
  }

  const catalog = item.pop || item;
  const marketVal = typeof catalog.marketPrice === 'number' ? catalog.marketPrice : (typeof catalog.marketValue === 'number' ? catalog.marketValue : 15);
  let computedRarity = catalog.rarity;
  if (!computedRarity) {
    computedRarity = marketVal >= 100 ? 'Grail' : marketVal > 25 ? 'Rare' : 'Common';
  }

  return {
    name: catalog.name || 'Unknown Pop',
    series: catalog.series || 'General',
    number: catalog.itemNumber || catalog.number || catalog.releaseYear || '0',
    image: catalog.imageUrl || catalog.image || '',
    marketValue: marketVal,
    rarity: computedRarity,
    boxCondition: item.boxCondition || catalog.boxCondition || 'Mint (9.5-10)',
    quantity: item.quantity || item.offeredQuantity || catalog.quantity || 1
  };
};

function PopPill({ pop }) {
  const item = parseItem(pop);
  const [imgError, setImgError] = useState(false);
  const hasValidImage = Boolean(item.image && typeof item.image === 'string' && item.image.trim() !== '' && item.image !== 'null');

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border-4 border-gray-805 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-[3px_3px_0px_rgba(0,0,0,0.75)] dark:shadow-[3px_3px_0px_rgba(0,174,239,0.3)]">
      <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-pink-100 dark:from-cyan-900 dark:to-pink-900 rounded-xl border-2 border-gray-800 flex items-center justify-center shrink-0 overflow-hidden p-1">
        {hasValidImage && !imgError ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-contain" 
            onError={() => setImgError(true)}
          />
        ) : (
          <Sparkles className="w-5 h-5 text-pink-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-black text-gray-800 dark:text-white text-sm truncate leading-tight">{item.name}</p>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">#{item.number} · {item.series}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 ${rarityColors[item.rarity] || rarityColors.Common}`}>
            {item.rarity}
          </span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border shadow-sm ${getConditionBadgeStyle(item.boxCondition)}`}>
            {item.boxCondition}
          </span>
          {item.quantity > 1 && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-900 text-yellow-400 border border-gray-800">
              x{item.quantity}
            </span>
          )}
          <span className="text-xs font-black text-cyan-500 ml-auto">${typeof item.marketValue === 'number' ? item.marketValue.toFixed(2) : item.marketValue}</span>
        </div>
      </div>
    </div>
  );
}

function IncomingCard({ trade, onAccept, onReject, onCounter, onHide }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
      whileHover={{ y: -4 }}
    >
      <div className="absolute inset-0 bg-black/25 dark:bg-[#00AEEF] rounded-3xl translate-x-1.5 translate-y-1.5" />
      <div className="relative bg-white dark:bg-gray-900 border-4 border-gray-800 dark:border-slate-600 rounded-3xl overflow-hidden dark:shadow-[5px_5px_0px_#00AEEF] dark:hover:shadow-[7px_7px_0px_#00AEEF] transition-all">
        {/* Header */}
        <div className="bg-gray-800 px-5 py-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${trade.fromGradient} border-2 border-white/30 flex items-center justify-center text-white font-black text-sm shrink-0`}>
            {trade.fromInitials}
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight">{trade.from}</p>
            <p className="text-gray-400 text-xs font-bold">wants to trade with you</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {trade.status !== 'pending' && (
              <button
                onClick={() => onHide(trade.id)}
                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 border-2 border-gray-800 text-red-600 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                title="Hide Trade History"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <Star className="w-5 h-5 text-yellow-400" fill="#FACC15" />
          </div>
        </div>

        {/* Trade layout */}
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">They Offer</p>
            <PopPill pop={trade.theyOffer} />
          </div>
          <div className="flex justify-center w-full my-[-8px] relative z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl border-2 border-gray-805 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
              <ArrowDownUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">For Your</p>
            <PopPill pop={trade.forYour} />
          </div>
        </div>

        {/* Action buttons or status indicator */}
        {trade.status !== 'pending' ? (
          <div className="px-4 pb-4">
            <span className={`flex items-center justify-center gap-1.5 h-10 border-4 py-2 font-black text-xs rounded-xl uppercase tracking-wider ${
              trade.status === 'accepted' || trade.status === 'approved'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-700 shadow-[2px_2px_0px_rgba(0,0,0,0.75)]'
                : trade.status === 'rejected'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-700 shadow-[2px_2px_0px_rgba(0,0,0,0.75)]'
                  : 'bg-gray-400 text-white border-gray-600 shadow-[2px_2px_0px_rgba(0,0,0,0.75)]'
            }`}>
              {trade.status === 'accepted' ? 'Accepted' : trade.status === 'rejected' ? 'Rejected' : 'Canceled'}
            </span>
          </div>
        ) : (
          <div className="px-4 pb-4 flex gap-2 sm:gap-3">
            <motion.button
              onClick={() => onReject(trade.id)}
              className="flex-1 h-10 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-xs rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.75)] flex items-center justify-center gap-1"
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              <X className="w-3.5 h-3.5" /> Decline
            </motion.button>

            <motion.button
              onClick={() => onCounter(trade.senderId)}
              className="flex-1 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-xs rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.75)] flex items-center justify-center gap-1"
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              <ArrowDownUp className="w-3.5 h-3.5" /> Counter
            </motion.button>

            <motion.button
              onClick={() => onAccept(trade.id, trade.senderId, trade.from)}
              className="flex-1 h-10 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xs rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.75)] flex items-center justify-center gap-1"
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OutgoingCard({ trade, index, onCancel, onHide }) {
  const status = statusConfig[trade.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4 }}
    >
      <div className="absolute inset-0 bg-black/20 dark:bg-[#EC008C] rounded-3xl translate-x-1.5 translate-y-1.5" />
      <div className="relative bg-white dark:bg-gray-900 border-4 border-gray-800 dark:border-slate-600 rounded-3xl overflow-hidden dark:shadow-[5px_5px_0px_#EC008C] dark:hover:shadow-[7px_7px_0px_#EC008C] transition-all">
        {/* Header */}
        <div className="bg-gray-800 px-5 py-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${trade.toGradient} border-2 border-white/30 flex items-center justify-center text-white font-black text-sm shrink-0`}>
            {trade.toInitials}
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight">To: {trade.to}</p>
            <p className="text-gray-400 text-xs font-bold">your offer</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <motion.div
              className={`${status.bg} ${status.text} border-4 ${status.border} rounded-xl px-3 py-1 flex items-center gap-1 shadow-[3px_3px_0px_rgba(0,0,0,0.6)]`}
              animate={trade.status === 'pending' ? { rotate: [-2, 2, -2] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transform: 'rotate(-2deg)' }}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span className="font-black text-xs tracking-wide">{status.label}</span>
            </motion.div>

            {/* Hide single resolved outgoing trade */}
            {trade.status !== 'pending' && (
              <button
                onClick={() => onHide(trade.id)}
                className="p-1.5 rounded-lg bg-red-105 hover:bg-red-200 border-2 border-gray-850 text-red-650 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                title="Hide Trade History"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Trade layout */}
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">You Offered</p>
            <PopPill pop={trade.youOffered} />
          </div>
          <div className="flex justify-center w-full my-[-8px] relative z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl border-2 border-gray-805 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
              <ArrowDownUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">For Their</p>
            <PopPill pop={trade.forTheir} />
          </div>
        </div>

        {/* Withdraw Button if pending */}
        {trade.status === 'pending' && (
          <div className="px-4 pb-4">
            <motion.button
              onClick={() => onCancel(trade.id)}
              className="w-full h-10 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-xs rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.75)] flex items-center justify-center gap-1.5"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-4 h-4" /> Withdraw / Cancel Request
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TradeManager() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState(null); // { id, username }
  const [selectedChatRecipient, setSelectedChatRecipient] = useState(null); // { id, username }

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const isVipOrAdmin = currentUser?.isVIP || currentUser?.role === 'vip' || currentUser?.role === 'admin';

  // Load incoming & outgoing trade lists on mount
  useEffect(() => {
    if (!isVipOrAdmin) return;

    setLoading(true);
    const headers = { 'Authorization': `Bearer ${currentUser?.token}` };

    Promise.all([
      fetch(getApiUrl('/api/trades/incoming'), { headers }).then(res => res.json()),
      fetch(getApiUrl('/api/trades/outgoing'), { headers }).then(res => res.json())
    ])
      .then(([incomingData, outgoingData]) => {
        // Map database incoming trades
        const mappedIncoming = (Array.isArray(incomingData) ? incomingData : []).map(trade => ({
          id: trade._id,
          from: trade.sender?.username || 'Collector',
          fromInitials: (trade.sender?.username || 'CO').slice(0, 2).toUpperCase(),
          fromGradient: trade.sender?.role === 'admin'
            ? 'from-cyan-500 to-blue-500'
            : 'from-pink-500 to-rose-500',
          theyOffer: { ...parseItem(trade.offeredItem), boxCondition: trade.offeredCondition || parseItem(trade.offeredItem).boxCondition, quantity: trade.offeredQuantity || 1 },
          forYour: { ...parseItem(trade.requestedItem), boxCondition: trade.requestedCondition || parseItem(trade.requestedItem).boxCondition, quantity: 1 },
          senderId: trade.sender?._id || trade.sender,
          status: trade.status
        }));

        // Map database outgoing trades
        const mappedOutgoing = (Array.isArray(outgoingData) ? outgoingData : []).map(trade => ({
          id: trade._id,
          to: trade.receiver?.username || 'Collector',
          toInitials: (trade.receiver?.username || 'CO').slice(0, 2).toUpperCase(),
          toGradient: trade.receiver?.role === 'admin'
            ? 'from-cyan-500 to-blue-500'
            : 'from-yellow-500 to-orange-500',
          youOffered: { ...parseItem(trade.offeredItem), boxCondition: trade.offeredCondition || parseItem(trade.offeredItem).boxCondition, quantity: trade.offeredQuantity || 1 },
          forTheir: { ...parseItem(trade.requestedItem), boxCondition: trade.requestedCondition || parseItem(trade.requestedItem).boxCondition, quantity: 1 },
          status: trade.status
        }));

        setIncoming(mappedIncoming);
        setOutgoing(mappedOutgoing);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Failed to fetch trades:', err);
        setLoading(false);
      });
  }, [currentUser, isVipOrAdmin]);

  const handleAccept = (id, senderId, senderName) => {
    fetch(getApiUrl(`/api/trades/${id}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser?.token}`
      },
      body: JSON.stringify({ status: 'accepted' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          hotToast.error(data.error);
        } else {
          setIncoming(prev => prev.map(t => t.id === id ? { ...t, status: 'accepted' } : t));
          hotToast.success('✅ Trade Accepted! Sweet deal!');
          setSuccessModal({
            id: senderId,
            username: senderName
          });
          window.dispatchEvent(new Event('trade_status_changed'));
        }
      })
      .catch(err => {
        console.error(err);
        hotToast.error('Failed to accept trade.');
      });
  };

  const handleReject = (id) => {
    fetch(getApiUrl(`/api/trades/${id}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser?.token}`
      },
      body: JSON.stringify({ status: 'rejected' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          hotToast.error(data.error);
        } else {
          setIncoming(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
          hotToast.success('❌ Offer Declined.');
          window.dispatchEvent(new Event('trade_status_changed'));
        }
      })
      .catch(err => {
        console.error(err);
        hotToast.error('Failed to reject trade.');
      });
  };

  const handleCancel = (id) => {
    fetch(getApiUrl(`/api/trades/${id}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser?.token}`
      },
      body: JSON.stringify({ status: 'canceled' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          hotToast.error(data.error);
        } else {
          setOutgoing(prev => prev.map(t => t.id === id ? { ...t, status: 'canceled' } : t));
          hotToast.success('✅ Request withdrawn successfully.');
          window.dispatchEvent(new Event('trade_status_changed'));
        }
      })
      .catch(err => {
        console.error(err);
        hotToast.error('Failed to withdraw request.');
      });
  };

  const handleHide = (id) => {
    fetch(getApiUrl(`/api/trades/${id}/hide`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${currentUser?.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          hotToast.error(data.error);
        } else {
          setIncoming(prev => prev.filter(t => t.id !== id));
          setOutgoing(prev => prev.filter(t => t.id !== id));
          hotToast.success('🗑️ Trade hidden from history.');
        }
      })
      .catch(err => {
        console.error(err);
        hotToast.error('Failed to hide trade.');
      });
  };

  const handleClearHistory = () => {
    fetch(getApiUrl('/api/trades/hide-resolved'), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${currentUser?.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          hotToast.error(data.error);
        } else {
          setIncoming(prev => prev.filter(t => t.status === 'pending'));
          setOutgoing(prev => prev.filter(t => t.status === 'pending'));
          hotToast.success('History cleared! Note: Active pending requests were not deleted and remain active.');
        }
      })
      .catch(err => {
        console.error(err);
        hotToast.error('Failed to clear history.');
      });
  };

  const handleCounter = (senderId) => {
    if (senderId) {
      navigate(`/PublicVault?id=${senderId}`);
      hotToast.success("Propose a counter trade offer!");
    } else {
      hotToast.error("Failed to redirect to profile.");
    }
  };

  // VIP Access Guard Layout
  if (!isVipOrAdmin) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b-4 border-gray-800 px-6 py-4 flex items-center gap-4 shadow-[0_4px_0px_rgba(0,0,0,0.8)]">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-400 border-4 border-gray-800 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-2xl font-black text-gray-850 dark:text-white uppercase tracking-wider">
            Trade Manager
          </h1>
        </div>

        {/* Upgrade Screen */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            className="max-w-md w-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 border-4 border-gray-850 rounded-3xl p-8 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.3 }}
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
              backgroundSize: '15px 15px'
            }} />
            
            <div className="relative z-10">
              <motion.div
                className="w-20 h-20 bg-yellow-400 rounded-3xl border-4 border-gray-900 mx-auto flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.5)] mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-10 h-10 text-gray-900" />
              </motion.div>

              <div className="inline-block bg-gray-800 text-yellow-400 font-black text-xs px-3 py-1 rounded-full border-2 border-gray-900 mb-4 tracking-widest uppercase">
                VIP Feature Required
              </div>

              <h2 className="text-3xl font-black text-gray-950 mb-3 uppercase tracking-wide leading-tight">
                Unlock Trade Manager 👑
              </h2>
              <p className="text-gray-950 font-bold text-sm mb-6 leading-relaxed">
                Negotiate, send, and review trade offers directly with Funko Pop collectors around the globe. Upgrade to VIP to gain access now!
              </p>

              <BouncyButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/vip-upgrade')}
                className="w-full justify-center text-sm font-black border-4 border-gray-800 bg-gray-800 text-yellow-400 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
              >
                Upgrade to VIP Status
              </BouncyButton>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const pendingCount = incoming.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-12 h-12 bg-white dark:bg-gray-900 border-4 border-gray-800 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
            >
              <ArrowLeft className="w-6 h-6 text-gray-805 dark:text-white" />
            </button>
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl border-4 border-gray-800 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.75)]">
              <ArrowDownUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-white leading-tight">Trade Manager</h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold">Your trading hub — review offers & track history</p>
            </div>
            <motion.button
              onClick={() => navigate('/CollectorSearch')}
              className="ml-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-black text-xs rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.85)]"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              New Trade
            </motion.button>
            {pendingCount > 0 && (
              <motion.div
                className="hidden sm:block bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm px-4 py-2 rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.75)] animate-pulse"
              >
                {pendingCount} Pending
              </motion.div>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-lg font-black text-gray-500 animate-pulse">Loading trade details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incoming Offers */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full" />
                <h2 className="text-xl font-black text-gray-800 dark:text-white">Incoming Offers</h2>
                {pendingCount > 0 && (
                  <span className="bg-pink-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-850">
                    {pendingCount}
                  </span>
                )}
              </div>

              <div className="space-y-5">
                <AnimatePresence>
                  {incoming.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white dark:bg-gray-900 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-10 text-center flex flex-col items-center justify-center w-full min-h-[320px]"
                    >
                      <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="font-black text-gray-400 dark:text-gray-550 text-lg">No Pending Offers</p>
                      <p className="text-gray-450 dark:text-gray-550 font-bold text-sm mb-4">You're all caught up!</p>
                      <motion.button
                        onClick={() => navigate('/CollectorSearch')}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-black text-xs rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.85)]"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🔍 Find Collectors to Trade
                      </motion.button>
                    </motion.div>
                  ) : (
                    incoming.map(trade => (
                      <IncomingCard
                        key={trade.id}
                        trade={trade}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onCounter={handleCounter}
                        onHide={handleHide}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Outgoing / History */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                  <h2 className="text-xl font-black text-gray-800 dark:text-white">Sent Offers & History</h2>
                </div>
                {(outgoing.some(t => t.status !== 'pending') || incoming.some(t => t.status !== 'pending')) && (
                  <button
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-xs rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.85)] transition-all"
                  >
                    Clear History
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {outgoing.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-10 text-center flex flex-col items-center justify-center w-full min-h-[320px]">
                    <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="font-black text-gray-400 dark:text-gray-550 text-lg">No Sent Offers</p>
                    <p className="text-gray-450 dark:text-gray-550 font-bold text-sm mb-4">You haven't sent any offers yet.</p>
                    <motion.button
                      onClick={() => navigate('/CollectorSearch')}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-black text-xs rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.85)]"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🔍 Find Collectors to Trade
                    </motion.button>
                  </div>
                ) : (
                  outgoing.map((trade, i) => (
                    <OutgoingCard
                      key={trade.id}
                      trade={trade}
                      index={i}
                      onCancel={handleCancel}
                      onHide={handleHide}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Trade & Chat Suggestion Modal */}
      <AnimatePresence>
        {successModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-md bg-white border-4 border-gray-800 rounded-3xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-16 h-16 bg-green-100 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-gray-850 uppercase tracking-wide mb-2">Trade Successful!</h3>
              <p className="text-gray-650 font-bold text-sm mb-6">
                The items have been swapped in your vaults. Would you like to chat with <span className="text-pink-500 font-black">{successModal.username}</span> to arrange shipping?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSuccessModal(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-805 font-black text-sm rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.85)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.85)] transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const recipient = successModal;
                    setSuccessModal(null);
                    setSelectedChatRecipient(recipient);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-sm rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Open Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Private Message Modal overlay */}
      {selectedChatRecipient && (
        <PrivateChatModal
          recipientId={selectedChatRecipient.id}
          recipientName={selectedChatRecipient.username}
          onClose={() => setSelectedChatRecipient(null)}
        />
      )}
    </div>
  );
}