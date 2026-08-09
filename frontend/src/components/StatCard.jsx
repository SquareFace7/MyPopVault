import React from 'react';
import { motion } from 'framer-motion';

const cardThemes = {
  value: {
    gradient: 'from-cyan-400 to-blue-500',
    accent: '#00AEEF',
    pattern: 'diamonds',
    textClass: 'text-white',
    titleClass: 'text-white/80',
    subtitleClass: 'text-white/70',
    iconClass: 'text-white'
  },
  count: {
    gradient: 'from-pink-400 to-rose-500',
    accent: '#EC008C',
    pattern: 'circles',
    textClass: 'text-white',
    titleClass: 'text-white/80',
    subtitleClass: 'text-white/70',
    iconClass: 'text-white'
  },
  roi: {
    gradient: 'from-yellow-400 to-orange-500',
    accent: '#FFD700',
    pattern: 'stars',
    textClass: 'text-gray-900',
    titleClass: 'text-gray-800',
    subtitleClass: 'text-gray-700',
    iconClass: 'text-gray-900'
  },
  rare: {
    gradient: 'from-purple-400 to-indigo-500',
    accent: '#9B5DE5',
    pattern: 'triangles',
    textClass: 'text-white',
    titleClass: 'text-white/80',
    subtitleClass: 'text-white/70',
    iconClass: 'text-white'
  }
};

export default function StatCard({ title, value, subtitle, icon: Icon, type = 'value', delay = 0 }) {
  const theme = cardThemes[type] || cardThemes.value;

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay, type: "spring", bounce: 0.4 }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
    >
      {/* Card Shadow */}
      <div className="absolute inset-0 bg-black/20 rounded-3xl translate-y-2 translate-x-1 blur-sm" />
      
      {/* Card Body */}
      <div className={`
        relative bg-gradient-to-br ${theme.gradient}
        rounded-3xl p-6 overflow-hidden
        border-4 border-white dark:border-slate-600 shadow-2xl dark:shadow-[5px_5px_0px_#00AEEF]
        min-h-[180px] flex flex-col justify-between
      `}>
        {/* Trading Card Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" aria-hidden="true">
            <pattern id={`pattern-${type}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              {theme.pattern === 'diamonds' && (
                <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="white" />
              )}
              {theme.pattern === 'circles' && (
                <circle cx="20" cy="20" r="15" fill="white" />
              )}
              {theme.pattern === 'stars' && (
                <polygon points="20,0 25,15 40,15 28,25 32,40 20,30 8,40 12,25 0,15 15,15" fill="white" />
              )}
              {theme.pattern === 'triangles' && (
                <polygon points="20,0 40,40 0,40" fill="white" />
              )}
            </pattern>
            <rect width="100%" height="100%" fill={`url(#pattern-${type})`} />
          </svg>
        </div>

        {/* Holographic Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />

        {/* Card Number Badge */}
        <div className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg" aria-hidden="true">
          <span className="text-xs font-black" style={{ color: type === 'roi' ? '#b45309' : theme.accent }}>
            #{Math.floor(Math.random() * 999).toString().padStart(3, '0')}
          </span>
        </div>

        {/* Icon */}
        <div className="relative" aria-hidden="true">
          <motion.div 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm ${type === 'roi' ? 'bg-black/10' : 'bg-white/30'}`}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {Icon && <Icon className={`w-8 h-8 ${theme.iconClass}`} strokeWidth={2.5} />}
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative mt-auto">
          <p className={`text-sm font-semibold uppercase tracking-wider ${theme.titleClass}`}>{title}</p>
          <motion.p 
            className={`text-3xl font-black mt-1 ${theme.textClass}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3, type: "spring", bounce: 0.5 }}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className={`text-sm mt-1 ${theme.subtitleClass}`}>{subtitle}</p>
          )}
        </div>

        {/* Corner Decorations */}
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-white/30 rounded-bl-3xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-white/30 rounded-tr-3xl" />
      </div>
    </motion.div>
  );
}