import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-300',
  secondary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-300',
  accent: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-yellow-300',
  outline: 'bg-white border-4 border-gray-800 text-gray-800 shadow-gray-300',
  ghost: 'bg-transparent text-gray-800 hover:bg-gray-100',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
};

export default function BouncyButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  className = '',
  ...props 
}) {
  return (
    <motion.button
      className={`
        relative inline-flex items-center justify-center gap-2
        font-bold rounded-2xl
        ${variants[variant]}
        ${sizes[size]}
        shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -3,
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.95,
        y: disabled ? 0 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15
      }}
      {...props}
    >
      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6 }}
      />

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {Icon && iconPosition === 'left' && (
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Icon className="w-5 h-5" />
          </motion.span>
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Icon className="w-5 h-5" />
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}