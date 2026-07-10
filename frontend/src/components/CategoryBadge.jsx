import React from 'react';
import { motion } from 'framer-motion';

const categoryColors = {
  'Marvel': { bg: 'bg-red-600', text: 'text-white', shadow: 'shadow-red-300' },
  'Disney': { bg: 'bg-blue-600', text: 'text-white', shadow: 'shadow-blue-300' },
  'Star Wars': { bg: 'bg-yellow-500', text: 'text-gray-950', shadow: 'shadow-yellow-300' },
  'DC': { bg: 'bg-blue-700', text: 'text-white', shadow: 'shadow-blue-405' },
  'Anime': { bg: 'bg-pink-600', text: 'text-white', shadow: 'shadow-pink-300' },
  'Movies': { bg: 'bg-purple-600', text: 'text-white', shadow: 'shadow-purple-300' },
  'TV': { bg: 'bg-green-600', text: 'text-white', shadow: 'shadow-green-300' },
  'Games': { bg: 'bg-cyan-500', text: 'text-gray-950', shadow: 'shadow-cyan-300' },
  'Music': { bg: 'bg-orange-600', text: 'text-white', shadow: 'shadow-orange-300' },
  'Sports': { bg: 'bg-emerald-600', text: 'text-white', shadow: 'shadow-emerald-300' },
};

const rarityColors = {
  'Common': { bg: 'bg-gray-500', text: 'text-white' },
  'Uncommon': { bg: 'bg-green-600', text: 'text-white' },
  'Rare': { bg: 'bg-blue-600', text: 'text-white' },
  'Epic': { bg: 'bg-purple-600', text: 'text-white' },
  'Legendary': { bg: 'bg-orange-600', text: 'text-white' },
  'Grail': { bg: 'bg-gradient-to-r from-amber-500 via-red-500 to-pink-600', text: 'text-white' },
};

export default function CategoryBadge({ category, type = 'category', size = 'md' }) {
  const colors = type === 'category' 
    ? (categoryColors[category] || { bg: 'bg-gray-500', text: 'text-white', shadow: 'shadow-gray-300' })
    : (rarityColors[category] || { bg: 'bg-gray-500', text: 'text-white' });

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <motion.span
      className={`
        inline-flex items-center font-bold rounded-full
        ${colors.bg} ${colors.text} ${colors.shadow || ''}
        ${sizeClasses[size]}
        shadow-lg
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {category}
    </motion.span>
  );
}