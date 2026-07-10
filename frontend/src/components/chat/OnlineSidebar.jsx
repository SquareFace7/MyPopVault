import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

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

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function OnlineSidebar({ onlineUsers }) {
  return (
    <div className="w-64 bg-white border-l-4 border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-4 border-gray-800 bg-gradient-to-r from-cyan-500 to-blue-500">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-white" />
          <span className="font-black text-white text-sm">Online Collectors</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-xs font-bold">{onlineUsers.length} online</span>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {onlineUsers.map((user, index) => (
          <motion.div
            key={user.email}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-colors"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(user.email)} border-2 border-gray-800 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.3)]`}>
                <span className="text-white font-black text-xs">{getInitials(user.name)}</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <span className="text-sm font-bold text-gray-700 truncate">{user.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}