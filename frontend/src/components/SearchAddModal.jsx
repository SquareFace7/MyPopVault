import { getApiUrl } from '@/lib/api';

const RARITY_COLORS = {
  Common:    'bg-gray-100 text-gray-600 border-gray-400',
  Uncommon:  'bg-green-100 text-green-700 border-green-500',
  Rare:      'bg-blue-100 text-blue-700 border-blue-500',
  Epic:      'bg-purple-100 text-purple-700 border-purple-500',
  Legendary: 'bg-orange-100 text-orange-700 border-orange-500',
  Grail:     'bg-yellow-200 text-yellow-800 border-yellow-500',
};

export default function SearchAddModal({ isOpen, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());

  React.useEffect(() => {
    if (isOpen) {
      fetch(getApiUrl('/api/catalog?limit=500'))
        .then(res => res.json())
        .then(data => {
          const mapped = (data.items || []).map(pop => ({
            id: pop._id,
            name: pop.name,
            series: pop.series,
            number: pop.itemNumber,
            rarity: pop.marketPrice >= 100 ? 'Grail' : (pop.marketPrice > 25 ? 'Rare' : 'Common'),
            price: pop.marketPrice || 15,
            emoji: '✨'
          }));
          setCatalog(mapped);
        })
        .catch(err => console.error('Failed to fetch catalog:', err));
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return catalog;
    const q = query.toLowerCase();
    return catalog.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.series.toLowerCase().includes(q) ||
      String(p.number).toLowerCase().includes(q)
    );
  }, [catalog, query]);

  const handleAdd = (pop) => {
    setAddedIds(prev => new Set([...prev, pop.id]));
    onAdd({
      name: pop.name,
      series: pop.series,
      number: pop.number,
      rarity: pop.rarity,
      purchasePrice: pop.price,
      marketValue: pop.price,
      condition: 'Mint (9.5-10)',
      isExclusive: false,
      popId: pop.id
    });
  };

  const handleClose = () => {
    setQuery('');
    setAddedIds(new Set());
    onClose();
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
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-white border-4 border-gray-800 rounded-3xl shadow-[10px_10px_0px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col"
            style={{ maxHeight: '85vh' }}
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px'
            }} />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 pt-5 pb-4 border-b-4 border-gray-800 shrink-0">
              <div>
                <h2 className="text-xl font-black text-gray-800">Search Global Catalog</h2>
                <p className="text-xs text-gray-500 font-bold">25,000+ Pops — find yours & add to vault</p>
              </div>
              <motion.button
                onClick={handleClose}
                className="w-9 h-9 bg-gray-100 border-2 border-gray-800 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.7)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-gray-700" />
              </motion.button>
            </div>

            {/* Search Bar */}
            <div className="relative px-5 py-4 shrink-0">
              <div className="flex items-center gap-3 bg-gray-50 border-4 border-gray-800 rounded-2xl px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.7)]">
                <Search className="w-5 h-5 text-pink-500 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search the global catalog..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-gray-800 font-bold text-sm placeholder-gray-400 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-2">
              {results.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="font-black text-gray-400">No Pops found</p>
                </div>
              ) : results.map((pop, i) => (
                <motion.div
                  key={pop.id}
                  className="flex items-center gap-3 bg-white border-2 border-gray-800 rounded-2xl px-3 py-2.5 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {pop.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-800 text-sm truncate">{pop.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-bold">{pop.series}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400 font-bold">#{pop.number}</span>
                    </div>
                  </div>

                  {/* Rarity badge */}
                  <span className={`hidden sm:block text-xs font-black px-2 py-0.5 rounded-lg border-2 shrink-0 ${RARITY_COLORS[pop.rarity]}`}>
                    {pop.rarity}
                  </span>

                  {/* Add button */}
                  <motion.button
                    onClick={() => handleAdd(pop)}
                    disabled={addedIds.has(pop.id)}
                    className={`flex items-center gap-1 font-black text-xs px-3 py-1.5 rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)] shrink-0 ${
                      addedIds.has(pop.id)
                        ? 'bg-green-400 text-white cursor-default'
                        : 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
                    }`}
                    whileHover={addedIds.has(pop.id) ? {} : { y: -1, boxShadow: '2px 4px 0px rgba(0,0,0,0.7)' }}
                    whileTap={addedIds.has(pop.id) ? {} : { y: 0 }}
                  >
                    {addedIds.has(pop.id)
                      ? <><Sparkles className="w-3 h-3" /> Added!</>
                      : <><Plus className="w-3 h-3" /> Add</>
                    }
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}