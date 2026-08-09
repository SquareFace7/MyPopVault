import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, TrendingDown, Sparkles, Star, Trash2 } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

import { getConditionBadgeStyle } from '@/lib/conditionHelper';

export default function PopCard({ item, index = 0, onClick, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const roi = item.marketValue && item.purchasePrice 
    ? ((item.marketValue - item.purchasePrice) / item.purchasePrice * 100).toFixed(1)
    : 0;
  const isPositiveRoi = parseFloat(roi) >= 0;

  const rarityGlow = {
    'Common': '',
    'Uncommon': 'shadow-green-400/50',
    'Rare': 'shadow-blue-400/50',
    'Epic': 'shadow-purple-400/50',
    'Legendary': 'shadow-orange-400/50',
    'Grail': 'shadow-yellow-400/50',
  };

  return (
    <motion.div
      className="relative cursor-pointer perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        bounce: 0.4
      }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        rotateX: -5,
        z: 50
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick && onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(item);
        }
      }}
    >
      {/* Box Shadow */}
      <motion.div 
        className={`absolute inset-0 bg-black/30 rounded-2xl ${rarityGlow[item.rarity] || ''}`}
        animate={{ 
          translateY: isHovered ? 8 : 4,
          translateX: isHovered ? 4 : 2,
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 10px 20px -5px rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* Funko Box Style Card */}
      {(() => {
        const neonShadow = index % 2 === 0
          ? 'dark:shadow-[5px_5px_0px_#00AEEF] dark:hover:shadow-[7px_7px_0px_#00AEEF]'
          : 'dark:shadow-[5px_5px_0px_#EC008C] dark:hover:shadow-[7px_7px_0px_#EC008C]';
        return (
          <div className={`relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-800 dark:border-slate-600 ${neonShadow} transition-all`}>
            {/* Top Section - Number Badge & Series */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <span className="text-white font-black text-lg">#{item.number}</span>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 bg-gray-900 border border-yellow-400/50 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
              Qty: {item.quantity || 1}
            </span>
            <CategoryBadge category={item.series} size="sm" />
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item);
                }}
                className="p-1 rounded bg-red-500/20 hover:bg-red-500/80 text-red-400 hover:text-white transition-all border border-red-500/40"
                title="Remove from Vault"
                aria-label={`Remove ${item.name} from Vault`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Window Section - Image */}
        <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
          {/* Window Frame */}
          <div className="relative bg-white dark:bg-gray-950 rounded-xl p-2 border-4 border-gray-300 dark:border-slate-700 shadow-inner">
            {/* Exclusive Badge */}
            {item.isExclusive && (
              <motion.div 
                className="absolute -top-2 -right-2 z-20"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-950 text-xs font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3" fill="currentColor" aria-hidden="true" />
                  EXCLUSIVE
                </div>
              </motion.div>
            )}

            {/* Image */}
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-50 to-pink-50">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-16 h-16 text-pink-400" aria-hidden="true" />
                  </motion.div>
                </div>
              )}

              {/* Hover Overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
              >
                <span className="text-white font-bold text-sm">View Details</span>
              </motion.div>
            </div>
          </div>

          {/* Rarity & Condition Badges */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={item.rarity} type="rarity" size="sm" />
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${getConditionBadgeStyle(item.boxCondition || 'Mint (9.5-10)')}`}>
              {item.boxCondition || 'Mint (9.5-10)'}
            </span>
          </div>
        </div>

        {/* Bottom Section - Info */}
        <div className="bg-gray-800 dark:bg-gray-900 px-4 py-3">
          <h3 className="text-white font-bold text-lg truncate">{item.name}</h3>
          
          {/* Price Info */}
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-gray-400 text-xs">Market Value</p>
              <p className="text-cyan-400 font-black text-xl">
                ${(item.marketValue || 0).toFixed(2)}
              </p>
            </div>
            
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              isPositiveRoi ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {isPositiveRoi ? (
                <TrendingUp className="w-4 h-4 text-green-400" aria-hidden="true" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" aria-hidden="true" />
              )}
              <span className={`font-bold text-sm ${
                isPositiveRoi ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositiveRoi ? '+' : ''}{roi}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  })()}
</motion.div>
  );
}