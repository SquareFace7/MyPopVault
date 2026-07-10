import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-yellow-400 to-orange-500',
  'from-purple-500 to-indigo-500',
  'from-green-500 to-emerald-500',
];

function getAvatarColor(email = '') {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function MessageBubble({ message, isOwn }) {
  const initials = getInitials(message.author_name);
  const avatarColor = getAvatarColor(message.author_email);
  const timestamp = message.created_date
    ? format(new Date(message.created_date), 'HH:mm')
    : '';

  return (
    <motion.div
      className={`flex items-end gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${avatarColor} border-2 border-gray-800 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.3)]`}>
          <span className="text-white font-black text-xs">{initials}</span>
        </div>
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Name */}
        {!isOwn && (
          <span className="text-xs font-black text-gray-600 px-2">{message.author_name}</span>
        )}

        {/* Text Bubble */}
        <div className={`
          relative px-4 py-3 rounded-2xl border-4 border-gray-800 font-bold text-sm
          shadow-[4px_4px_0px_rgba(0,0,0,0.8)]
          ${isOwn
            ? 'bg-gradient-to-br from-pink-500 to-orange-500 text-white rounded-br-sm'
            : 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-bl-sm'
          }
        `}>
          {message.text}
        </div>

        {/* Timestamp */}
        <span className={`text-xs text-gray-400 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
          {timestamp}
        </span>
      </div>
    </motion.div>
  );
}