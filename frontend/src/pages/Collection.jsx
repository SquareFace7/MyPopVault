import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';
import { 
  Search, Filter, Plus, Grid, List, 
  Package, Sparkles, X 
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PopCard from '@/components/PopCard';
import CatalogPickerModal from '@/components/CatalogPickerModal';
import PopDetailModal from '@/components/PopDetailModal';
import BouncyButton from '@/components/BouncyButton';
import CategoryBadge from '@/components/CategoryBadge';
import { getConditionMultiplier } from '@/lib/conditionHelper';

const seriesOptions = ['All', 'Marvel', 'Disney', 'Star Wars', 'DC', 'Anime'];
const rarityOptions = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Grail'];
const sortOptions = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'value-desc', label: 'Highest Value' },
  { value: 'value-asc', label: 'Lowest Value' },
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'number-asc', label: 'Number (Low-High)' },
  { value: 'number-desc', label: 'Number (High-Low)' },
];

export default function Collection() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPop, setSelectedPop] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [pops, setPops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
              rarity: marketVal >= 100 ? 'Grail' : marketVal > 25 ? 'Rare' : 'Common',
              purchasePrice: item.purchasePrice || 0,
              boxCondition: item.boxCondition || 'Mint (9.5-10)',
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
          const mVal = popDetails.marketPrice || p.marketValue || 15.00;
          return {
            ...p,
            id: data.vaultItem._id,
            popId: popDetails._id || p.popId,
            name: popDetails.name || p.name,
            series: popDetails.series || p.series,
            number: popDetails.itemNumber || p.number,
            rarity: mVal >= 100 ? 'Grail' : (mVal > 25 ? 'Rare' : 'Common'),
            purchasePrice: data.vaultItem.purchasePrice || 0,
            boxCondition: data.vaultItem.boxCondition || 'Mint (9.5-10)',
            quantity: data.vaultItem.quantity || 1,
            marketValue: mVal,
            image: popDetails.imageUrl || p.image || null
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

  // Filter and sort pops
  const filteredPops = useMemo(() => {
    let result = [...pops];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(pop => 
        pop.name?.toLowerCase().includes(query) ||
        pop.series?.toLowerCase().includes(query) ||
        pop.number?.toString().includes(query)
      );
    }

    // Series filter
    if (selectedSeries !== 'All') {
      result = result.filter(pop => pop.series === selectedSeries);
    }

    // Rarity filter
    if (selectedRarity !== 'All') {
      result = result.filter(pop => pop.rarity === selectedRarity);
    }

    // Sort
    const [sortField, sortDir] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'value':
          comparison = (a.marketValue || 0) - (b.marketValue || 0);
          break;
        case 'date':
          comparison = new Date(a.created_date || 0) - new Date(b.created_date || 0);
          break;
        case 'number':
          comparison = (a.number || 0) - (b.number || 0);
          break;
      }
      return sortDir === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [pops, searchQuery, selectedSeries, selectedRarity, sortBy]);

  // Get series counts for badges
  const seriesCounts = useMemo(() => {
    return pops.reduce((acc, pop) => {
      acc[pop.series] = (acc[pop.series] || 0) + 1;
      return acc;
    }, {});
  }, [pops]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSeries('All');
    setSelectedRarity('All');
    setSortBy('date-desc');
  };

  const hasActiveFilters = searchQuery || selectedSeries !== 'All' || selectedRarity !== 'All';

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
              <Package className="w-10 h-10 text-cyan-500" />
              Collection
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{pops.length} Pops in your vault</p>
          </div>

          <BouncyButton
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Pop
          </BouncyButton>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border-4 border-gray-850 dark:border-slate-600 p-6 mb-8 dark:shadow-[4px_4px_0px_#00AEEF]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name, series, or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-gray-200 dark:border-slate-700 rounded-2xl focus:border-cyan-500 bg-white dark:bg-gray-955 dark:text-white"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <div className="flex gap-2 lg:hidden">
              <BouncyButton
                variant="outline"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1"
              >
                Filters {hasActiveFilters && '•'}
              </BouncyButton>
            </div>

            {/* Filters (Desktop always visible, Mobile toggle) */}
            <div className={`flex flex-col lg:flex-row gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
              <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                <SelectTrigger className="w-full lg:w-40 h-12 border-2 border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Series</SelectItem>
                  {seriesOptions.slice(1).map(series => (
                    <SelectItem key={series} value={series}>
                      {series} {seriesCounts[series] ? `(${seriesCounts[series]})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger className="w-full lg:w-40 h-12 border-2 border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent>
                  {rarityOptions.map(rarity => (
                    <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <BouncyButton
                  variant="ghost"
                  icon={X}
                  onClick={clearFilters}
                  className="text-gray-500"
                >
                  Clear
                </BouncyButton>
              )}
            </div>
          </div>

          {/* Active Series Quick Filters */}
          {Object.keys(seriesCounts).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 self-center mr-2">Quick filters:</span>
              {Object.entries(seriesCounts).slice(0, 6).map(([series, count]) => (
                <motion.button
                  key={series}
                  onClick={() => setSelectedSeries(selectedSeries === series ? 'All' : series)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CategoryBadge 
                    category={`${series} (${count})`} 
                  />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Results Count & View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing <span className="font-bold text-gray-800 dark:text-white">{filteredPops.length}</span> 
            {filteredPops.length !== pops.length && ` of ${pops.length}`} Pops
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collection Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse border-4 border-gray-350" />
            ))}
          </div>
        ) : filteredPops.length > 0 ? (
          <motion.div 
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}
            layout
          >
            <AnimatePresence>
              {filteredPops.map((pop, index) => (
                <PopCard
                  key={pop.id}
                  item={pop}
                  index={index}
                  onClick={() => navigate(`/pop/${pop.popId}`)}
                  onRemove={(item) => handleDeletePop(item.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className="bg-gradient-to-br from-pink-50 to-cyan-50 rounded-3xl p-12 text-center border-4 border-dashed border-gray-300 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] max-w-lg mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            </motion.div>
            {hasActiveFilters ? (
              <>
                <h3 className="text-xl font-black text-gray-700 mb-2">No Pops Found</h3>
                <p className="text-gray-500 mb-6 font-bold text-sm">Try adjusting your filters</p>
                <BouncyButton variant="outline" onClick={clearFilters}>
                  Clear Filters
                </BouncyButton>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black text-gray-700 mb-2">Your Vault is Empty!</h3>
                <p className="text-gray-500 mb-6 font-bold text-sm font-sans">Start adding Funko Pops to track their value</p>
                <BouncyButton
                  variant="primary"
                  icon={Plus}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Your First Pop
                </BouncyButton>
              </>
            )}
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