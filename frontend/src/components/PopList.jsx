import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function PopList() {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(getApiUrl('/api/pops'))
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch pops from API');
        return res.json();
      })
      .then(data => {
        setPops(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold mt-4">Fetching database catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border-4 border-red-800 text-red-800 font-bold rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.85)] max-w-md mx-auto my-6 text-center">
        <p>❌ Connection Error: {error}</p>
        <p className="text-xs text-gray-500 mt-2">Ensure the backend API is running on port 5000.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        <Sparkles className="w-6 h-6 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-wide">
          Database Pop <span className="text-cyan-500">Catalog</span>
        </h2>
      </div>

      {pops.length === 0 ? (
        <div className="text-center py-16 bg-white border-4 border-dashed border-gray-400 rounded-3xl p-6 max-w-lg mx-auto shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
          <p className="text-xl font-black text-gray-600">The Database is Empty!</p>
          <p className="text-sm font-bold text-gray-400 mt-2">
            No entries have been added to your Atlas MongoDB yet. Use a POST request to add items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pops.map((pop, index) => (
            <motion.div
              key={pop._id || index}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ y: -4 }}
            >
              {/* Drop Shadow */}
              <div className="absolute inset-0 bg-black/30 rounded-3xl translate-x-1.5 translate-y-1.5" />

              {/* Card */}
              <div className="relative bg-white rounded-3xl overflow-hidden border-4 border-gray-800 h-full flex flex-col justify-between">
                {/* Card Header (Series & Vaulted status) */}
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-cyan-400 font-black text-xs uppercase tracking-widest">{pop.series}</span>
                  {pop.isVaulted && (
                    <span className="bg-pink-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full border-2 border-gray-850">
                      VAULTED
                    </span>
                  )}
                </div>

                {/* Card Display Box */}
                <div className="bg-gradient-to-b from-gray-50 to-gray-200 p-4 border-b-4 border-gray-800 flex-1 flex items-center justify-center">
                  <div className="w-full aspect-square bg-white rounded-2xl border-4 border-gray-300 shadow-inner flex items-center justify-center overflow-hidden p-2">
                    {pop.image ? (
                      <img src={pop.image} alt={pop.name} className="w-full h-full object-contain" />
                    ) : (
                      <Sparkles className="w-16 h-16 text-pink-300" />
                    )}
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-4 bg-white">
                  <h3 className="font-black text-base text-gray-800 truncate mb-1" title={pop.name}>
                    {pop.name}
                  </h3>
                  <div className="flex justify-between items-center mt-2 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-500" />
                      Year: {pop.releaseYear || 'N/A'}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 border-2 border-yellow-400 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                      MDB
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
