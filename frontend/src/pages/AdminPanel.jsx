import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Crown, Package, ArrowDownUp, Trash2, UserX, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';

// --- Sub-Components ---
function StatCard({ stat, index }) {
  return (
    <motion.div
      className={`relative bg-white dark:bg-gray-900 border-4 border-gray-800 rounded-3xl p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] overflow-hidden`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -4, boxShadow: '6px 10px 0px rgba(0,0,0,0.85)' }}
    >
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px'
      }} />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} border-4 border-gray-800 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.6)]`}>
          <stat.icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-3xl font-black text-gray-850 dark:text-white">{stat.value}</p>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{stat.label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function UserRow({ user, onToggleVIP }) {
  const username = user.username || user.name || 'User';
  const initial = username[0].toUpperCase();
  const isVip = user.role === 'vip';
  const isAdmin = user.role === 'admin';

  return (
    <motion.tr
      className="border-b-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-gray-800 flex items-center justify-center text-white font-black text-xs">
            {initial}
          </div>
          <div>
            <p className="font-black text-gray-800 dark:text-white text-sm">{username}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`font-black text-xs px-2 py-1 rounded-lg border-2 border-gray-800 ${isAdmin ? 'bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
          {user.role?.toUpperCase() || 'USER'}
        </span>
      </td>
      <td className="px-4 py-3 font-bold text-gray-655 dark:text-gray-350 text-sm">{user.pops || 0} pops</td>
      <td className="px-4 py-3">
        {isVip
          ? <span className="bg-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 font-black text-xs px-2 py-1 rounded-lg border-2 border-gray-800">👑 VIP</span>
          : isAdmin
          ? <span className="bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-black text-xs px-2 py-1 rounded-lg border-2 border-gray-800">Admin</span>
          : <span className="bg-gray-100 text-gray-500 dark:bg-gray-805 font-black text-xs px-2 py-1 rounded-lg border-2 border-gray-800">Standard</span>
        }
      </td>
      <td className="px-4 py-3">
        {!isAdmin ? (
          <motion.button
            onClick={() => onToggleVIP(user)}
            className={`flex items-center gap-1 font-black text-xs px-3 py-1.5 rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)] ${isVip ? 'bg-red-200 text-red-900 hover:bg-red-300' : 'bg-yellow-300 hover:bg-yellow-450 text-gray-900'}`}
            whileHover={{ y: -1, boxShadow: '2px 4px 0px rgba(0,0,0,0.7)' }}
            whileTap={{ y: 0, boxShadow: '1px 1px 0px rgba(0,0,0,0.7)' }}
          >
            {isVip ? <><XCircle className="w-3 h-3" /> Revoke VIP</> : <><CheckCircle className="w-3 h-3" /> Grant VIP</>}
          </motion.button>
        ) : (
          <span className="text-xs text-gray-400 font-bold italic">Admin Locked</span>
        )}
      </td>
    </motion.tr>
  );
}

// --- Main Page ---
export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVips: 0,
    totalPopsVaulted: 0,
    totalTrades: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch Stats and growth data
      const statsRes = await fetch(getApiUrl('/api/admin/stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalUsers: statsData.totalUsers,
          totalVips: statsData.totalVips,
          totalPopsVaulted: statsData.totalPopsVaulted,
          totalTrades: statsData.totalTrades
        });
        if (statsData.growthData) {
          setGrowthData(statsData.growthData);
        }
      }

      // Fetch Users List
      const usersRes = await fetch(getApiUrl('/api/admin/users'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch Flagged Moderation Queue
      const modRes = await fetch(getApiUrl('/api/admin/moderation'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (modRes.ok) {
        const modData = await modRes.json();
        setFlaggedMessages(Array.isArray(modData) ? modData : []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin stats:', error);
      toast.error('Failed to load system aggregates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteFlagged = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(getApiUrl(`/api/admin/moderation/${messageId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete flagged message');
      }

      toast.success('🗑️ Flagged message permanently deleted.');
      setFlaggedMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (error) {
      console.error('❌ Delete Moderation Error:', error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const handleDismissFlag = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(getApiUrl(`/api/admin/moderation/${messageId}/dismiss`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to dismiss flag');
      }

      toast.success('✅ Message flag dismissed.');
      setFlaggedMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (error) {
      console.error('❌ Dismiss Flag Error:', error);
      toast.error(`Dismiss failed: ${error.message}`);
    }
  };

  const handleToggleVIP = async (targetUser) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const newRole = targetUser.role === 'vip' ? 'user' : 'vip';

      const res = await fetch(getApiUrl(`/api/admin/users/${targetUser._id}/role`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update user role');
      }

      toast.success(newRole === 'vip' ? 'VIP Status granted successfully!' : 'VIP privileges revoked.');
      fetchAdminData(); // Refresh list and stats
    } catch (error) {
      console.error('❌ Failed to update role:', error);
      toast.error(`Action failed: ${error.message}`);
    }
  };

  const statsList = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'from-cyan-400 to-blue-500' },
    { label: 'Active VIPs', value: stats.totalVips.toLocaleString(), icon: Crown, color: 'from-yellow-400 to-orange-400' },
    { label: 'Pops Vaulted', value: stats.totalPopsVaulted.toLocaleString(), icon: Package, color: 'from-pink-400 to-rose-500' },
    { label: 'Total Trades', value: stats.totalTrades.toLocaleString(), icon: ArrowDownUp, color: 'from-purple-400 to-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8 transition-colors duration-200">
      {/* Dot background */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.01] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }} />

      {/* Page Header */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl border-4 border-gray-800 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.8)]">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white">Admin Control Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Full platform management — handle with care! ⚠️</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsList.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
      </div>

      {/* Growth Chart */}
      <motion.div
        className="bg-white dark:bg-gray-900 border-4 border-gray-800 rounded-3xl p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-black text-gray-800 dark:text-white">User Growth</h2>
        </div>
        <div className="w-full">
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC008C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EC008C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="month" tick={{ fontWeight: 800, fontSize: 12, fill: 'currentColor' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontWeight: 800, fontSize: 11, fill: 'currentColor' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: '3px solid #1f2937', borderRadius: '12px', fontWeight: 800, background: '#111827', color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#EC008C" strokeWidth={3} fill="url(#userGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-400 font-bold">Waiting for registry timeline statistics...</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Moderation Hub */}
      <motion.div
        className="bg-white dark:bg-gray-900 border-4 border-gray-800 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,0.85)] mb-8 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b-4 border-gray-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
          <div className="w-8 h-8 bg-red-500 rounded-xl border-2 border-gray-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-800 dark:text-white">Community Moderation Queue</h2>
          <span className="ml-auto bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-black text-xs px-3 py-1 rounded-full border-2 border-gray-800">
            {flaggedMessages.length} flagged
          </span>
        </div>

        {flaggedMessages.length > 0 ? (
          <div className="p-6 space-y-4">
            {flaggedMessages.map((msg) => (
              <div 
                key={msg._id} 
                className="bg-red-50/50 dark:bg-red-950/30 border-3 border-red-300 dark:border-red-800/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-gray-900 dark:text-white">
                      {msg.senderName || 'Anonymous'}
                    </span>
                    {msg.sender?.email && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                        ({msg.sender.email})
                      </span>
                    )}
                    <span className="bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200 font-black text-[10px] uppercase px-2 py-0.5 rounded-md border border-red-400">
                      ⚠️ {msg.flaggedReason || 'Flagged Content'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold ml-auto md:ml-0">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-bold text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400 text-xs font-black mr-2 uppercase">Censored Output:</span>
                    {msg.text}
                  </p>

                  {msg.originalText && msg.originalText !== msg.text && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-100/60 dark:bg-red-950/60 p-2 rounded-lg border border-red-200 dark:border-red-900">
                      <span className="font-black mr-1 uppercase">Original Raw Text:</span>
                      "{msg.originalText}"
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0 self-end md:self-center">
                  <motion.button
                    onClick={() => handleDismissFlag(msg._id)}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white font-black text-xs px-3 py-2 rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]"
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Dismiss Flag
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteFlagged(msg._id)}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-black text-xs px-3 py-2 rounded-xl border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full border-4 border-gray-800 flex items-center justify-center mb-4 shadow-[4px_4px_0px_rgba(0,0,0,0.85)]">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-black text-gray-800 dark:text-white mb-1">Moderation Queue Empty</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold max-w-sm font-sans">No flagged messages at this time. The community chat is clean and tidy! ✨</p>
          </div>
        )}
      </motion.div>

      {/* User Management */}
      <motion.div
        className="bg-white dark:bg-gray-900 border-4 border-gray-800 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,0.85)] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b-4 border-gray-800 bg-gradient-to-r from-yellow-50 to-cyan-50 dark:from-yellow-950/20 dark:to-cyan-950/20">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl border-2 border-gray-800 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-800 dark:text-white">User Management</h2>
          <span className="ml-auto bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 font-black text-xs px-3 py-1 rounded-full border-2 border-gray-800">
            {users.filter(u => u.role === 'vip').length} VIPs active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/40 border-b-2 border-gray-200 dark:border-gray-850">
                <th className="px-4 py-2 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Collection</th>
                <th className="px-4 py-2 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">VIP Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <UserRow key={user._id} user={user} onToggleVIP={handleToggleVIP} />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}