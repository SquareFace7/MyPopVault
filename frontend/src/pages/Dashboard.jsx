import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';
import { 
  DollarSign, Package, TrendingUp, Crown, Plus, ArrowRight, 
  Sparkles, RefreshCw, Star
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import PopCard from '@/components/PopCard';
import CatalogPickerModal from '@/components/CatalogPickerModal';
import PopDetailModal from '@/components/PopDetailModal';
import BouncyButton from '@/components/BouncyButton';
import { SeriesPieChart, RarityBarChart, ValueTrendChart } from '@/components/CollectionChart';

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPop, setSelectedPop] = useState(null);
  const [pops, setPops] = useState([]);
  const [grailAlerts, setGrailAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isVipOrAdmin = user?.isVIP || user?.isVip || user?.role?.toLowerCase() === 'vip' || user?.role?.toLowerCase() === 'admin';

  const fetchVault = () => {
    setIsLoading(true);
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
          const mapped = data.map(item => {
            const popDetails = item.pop || {};
            const marketVal = popDetails.marketPrice || 15.00;
            return {
              id: item._id,
              popId: popDetails._id,
              name: popDetails.name || 'Unknown Pop',
              series: popDetails.series || 'Other',
              number: popDetails.itemNumber || 2024,
              rarity: marketVal > 40 ? 'Grail' : marketVal > 25 ? 'Rare' : 'Common',
              purchasePrice: item.purchasePrice || 0,
              boxCondition: item.boxCondition || 'Mint',
              quantity: item.quantity || 1,
              marketValue: marketVal,
              image: popDetails.imageUrl || null,
              isExclusive: marketVal > 50,
              created_date: item.addedAt
            };
          });
          setPops(mapped);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch vault items:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (user && user.isLoggedIn) {
      fetchVault();
      if (isVipOrAdmin) {
        fetch(getApiUrl('/api/catalog/grail-alerts'))
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setGrailAlerts(data);
            }
          })
          .catch(err => console.error('Failed to fetch grail alerts:', err));
      }
    } else {
      navigate('/Login');
    }
  }, [user]);

  const handleAddPop = async (popData) => {
    try {
      const popId = popData.popId || popData.id || popData._id || popData;
      if (!popId) throw new Error('Pop ID is missing.');
      const response = await fetch(getApiUrl('/api/vault'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ popId })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to add Pop to vault');
      }

      toast.success('🎉 Pop successfully added to your vault!', {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      setIsAddModalOpen(false);
      fetchVault(); // Refresh vault list
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

  const handleDeletePop = async (vaultItemId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this Pop from your vault?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(getApiUrl(`/api/vault/${vaultItemId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete vault item');
      }

      setPops(prev => prev.filter(p => p.id !== vaultItemId));
      toast.success('🗑️ Pop successfully removed from your Vault!', {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      setSelectedPop(null);
    } catch (err) {
      console.error(err);
      toast.error(`⚠️ ${err.message || 'Could not delete Pop.'}`, {
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

  const handleUpdatePop = async (vaultItemId, updatedFields) => {
    try {
      const response = await fetch(getApiUrl(`/api/vault/${vaultItemId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedFields)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update Pop details');
      }

      setPops(prev => prev.map(p => {
        if (p.id === vaultItemId) {
          const popDetails = data.vaultItem.pop || {};
          return {
            id: data.vaultItem._id,
            popId: popDetails._id,
            name: popDetails.name || 'Unknown Pop',
            series: popDetails.series || 'Other',
            number: popDetails.releaseYear || 2024,
            rarity: popDetails.isVaulted ? 'Epic' : 'Common',
            purchasePrice: data.vaultItem.purchasePrice || 0,
            boxCondition: data.vaultItem.boxCondition || 'Mint',
            quantity: data.vaultItem.quantity || 1,
            marketValue: popDetails.isVaulted ? 45.00 : 15.00,
            image: popDetails.image || null,
            isExclusive: popDetails.isVaulted,
            created_date: data.vaultItem.addedAt
          };
        }
        return p;
      }));

      toast.success('✏️ Pop details updated successfully!', {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      setSelectedPop(null);
    } catch (err) {
      console.error(err);
      toast.error(`⚠️ ${err.message || 'Could not update Pop.'}`, {
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

  // Calculate stats using useMemo
  const stats = useMemo(() => {
    let value = 0;
    let paid = 0;
    let units = 0;
    pops.forEach(pop => {
      const q = pop.quantity || 1;
      value += (pop.marketValue || 0) * q;
      paid += (pop.purchasePrice || 0) * q;
      units += q;
    });
    const roi = paid > 0 ? ((value - paid) / paid * 100).toFixed(1) : 0;
    const rareCount = pops.filter(pop => ['Rare', 'Epic', 'Legendary', 'Grail'].includes(pop.rarity)).length;
    const topPops = [...pops].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)).slice(0, 4);

    return {
      totalValue: value,
      totalPaid: paid,
      units,
      roi,
      rareCount,
      topPops
    };
  }, [pops]);

  const { totalValue, totalPaid, units, roi, rareCount, topPops } = stats;

  // Market value refresh animation helper
  const refreshMarketValues = () => {
    toast.loading('Syncing latest valuation guides...', { id: 'sync' });
    setTimeout(() => {
      fetchVault();
      toast.success('Valuations updated successfully!', { id: 'sync' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-955 dark:via-gray-900 dark:to-gray-955 p-4 md:p-8 font-sans transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏆
              </motion.span>
              The Vault
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Your Personal Funko Pop Command Center</p>
          </div>

          <div className="flex gap-3">
            <BouncyButton
              variant="outline"
              icon={RefreshCw}
              onClick={refreshMarketValues}
            >
              Refresh Values
            </BouncyButton>
            <BouncyButton
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Pop
            </BouncyButton>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Value"
            value={`$${totalValue.toFixed(2)}`}
            subtitle="Market valuation"
            icon={DollarSign}
            type="value"
            delay={0}
          />
          <StatCard
            title="Collection Size"
            value={units}
            subtitle="Units in vault"
            icon={Package}
            type="count"
            delay={0.1}
          />
          <StatCard
            title="ROI"
            value={`${roi > 0 ? '+' : ''}${roi}%`}
            subtitle="Return on investment"
            icon={TrendingUp}
            type="roi"
            delay={0.2}
          />
          <StatCard
            title="Rare Finds"
            value={rareCount}
            subtitle="Epic or better"
            icon={Crown}
            type="rare"
            delay={0.3}
          />
        </div>

        {/* Charts Section */}
        {pops.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <SeriesPieChart data={pops} />
            <RarityBarChart data={pops} />
            <ValueTrendChart data={pops} />
          </div>
        )}

        {/* Top Valuable Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" fill="#FFD700" />
                Crown Jewels
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your most valuable Pops</p>
            </div>
            <Link to={createPageUrl('Collection')}>
              <BouncyButton variant="ghost" icon={ArrowRight} iconPosition="right" size="sm">
                View All
              </BouncyButton>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse animate-duration-1000 border-4 border-gray-300" />
              ))}
            </div>
          ) : topPops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topPops.map((pop, index) => (
                <PopCard 
                  key={pop.id} 
                  item={pop} 
                  index={index}
                  onClick={() => navigate(`/pop/${pop.popId}`)}
                  onRemove={(item) => handleDeletePop(item.id)}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="bg-gradient-to-br from-pink-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 text-center border-4 border-dashed border-gray-300 dark:border-slate-600 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_#EC008C] max-w-lg mx-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-16 h-16 text-pink-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-black text-gray-700 mb-2">Your Vault is Empty!</h3>
              <p className="text-gray-500 mb-6 font-bold text-sm">Start adding your Funko Pops to track their value</p>
              <BouncyButton
                variant="primary"
                icon={Plus}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Your First Pop
              </BouncyButton>
            </motion.div>
          )}
        </motion.div>

        {/* VIP Live Grail Alerts Widget (Positioned Below Crown Jewels) */}
        {isVipOrAdmin && (
          <motion.div
            className="mb-8 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border-4 border-amber-400 dark:border-amber-500/50 rounded-3xl p-6 shadow-[5px_5px_0px_#FFD700] relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl border-2 border-gray-800 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
                  <Crown className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-wider">
                      🔥 Live Grail Alerts
                    </h2>
                    <span className="bg-amber-400 text-gray-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full border border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] animate-pulse">
                      VIP Exclusive
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    High-value catalog items currently trending on valuation market
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/PopExplorer')}
                className="hidden sm:flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline"
              >
                Browse Catalog <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {grailAlerts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {grailAlerts.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    onClick={() => navigate(`/pop/${item._id}`)}
                    className="bg-white dark:bg-gray-900 border-3 border-gray-800 dark:border-slate-600 rounded-2xl p-3 shadow-[3px_3px_0px_#FFD700] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs font-black mb-2">
                      <span className="text-amber-500 uppercase truncate max-w-[90px]">{item.series}</span>
                      <span className="text-gray-400">#{item.itemNumber}</span>
                    </div>
                    <div className="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 flex items-center justify-center border-2 border-gray-200 dark:border-slate-700 mb-2">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-xs text-gray-800 dark:text-white truncate">{item.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 text-[10px] font-black px-1.5 py-0.5 rounded">
                          GRAIL
                        </span>
                        <span className="text-xs font-black text-cyan-500">${(item.marketPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-900/60 border-2 border-dashed border-amber-400 dark:border-amber-500/40 rounded-2xl p-8 text-center">
                <p className="font-black text-amber-700 dark:text-amber-400 text-sm">
                  No trending grails found in the market right now. Check back later!
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Stats Bar */}
        {pops.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-gray-800 to-gray-950 rounded-2xl p-6 flex flex-wrap justify-around items-center gap-6 border-4 border-gray-900 dark:border-slate-600 shadow-[4px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[4px_4px_0px_#00AEEF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { label: 'Total Invested', value: `$${totalPaid.toFixed(2)}` },
              { label: 'Avg. Pop Value', value: `$${(totalValue / pops.length).toFixed(2)}` },
              { label: 'Most Common Series', value: Object.entries(pops.reduce((acc, p) => { acc[p.series] = (acc[p.series] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' },
              { label: 'Profit/Loss', value: `${totalValue - totalPaid >= 0 ? '+' : ''}$${(totalValue - totalPaid).toFixed(2)}` },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-gray-400 text-sm font-bold">{stat.label}</p>
                <p className="text-white font-black text-2xl mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CatalogPickerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPop}
      />

      <PopDetailModal
        item={selectedPop}
        isOpen={!!selectedPop}
        onClose={() => setSelectedPop(null)}
        onDelete={(item) => handleDeletePop(item.id)}
        onEdit={handleUpdatePop}
      />
    </div>
  );
}