import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';

export default function PopArtBackground({ children, className = '', variant = 'hero' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const dots = React.useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      color: ['#00AEEF', '#EC008C', '#FFD700', '#9B5DE5', '#00F5D4'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 2
    }));
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Pop Art Halftone Pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <svg width="100%" height="100%">
          <pattern id="halftone" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="2.5" fill="#EC008C" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#halftone)" />
        </svg>
      </div>

      {/* Floating Shapes */}
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className={`absolute rounded-full ${isDark ? 'opacity-20' : 'opacity-[0.06]'}`}
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Comic-style starburst accents */}
      <motion.div
        className={`absolute -top-20 -right-20 w-64 h-64 ${isDark ? 'opacity-10' : 'opacity-[0.03]'}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100">
          <polygon
            points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
            fill="#FFD700"
          />
        </svg>
      </motion.div>

      <motion.div
        className={`absolute -bottom-10 -left-10 w-48 h-48 ${isDark ? 'opacity-10' : 'opacity-[0.03]'}`}
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100">
          <polygon
            points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
            fill="#EC008C"
          />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full min-h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}