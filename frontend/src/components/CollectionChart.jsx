import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  AreaChart, Area, CartesianGrid
} from 'recharts';

const COLORS = ['#00AEEF', '#EC008C', '#FFD700', '#9B5DE5', '#00F5D4', '#FF6B6B', '#4ECDC4', '#45B7D1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-gray-200">
        <p className="font-bold text-gray-800">{label || payload[0].name}</p>
        <p className="text-cyan-500 font-semibold">${payload[0].value?.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const CustomCountTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-gray-200 font-bold text-sm">
        <p className="text-gray-800">{payload[0].payload.name}</p>
        <p className="text-pink-500 font-semibold">{payload[0].value} units</p>
      </div>
    );
  }
  return null;
};

export function SeriesPieChart({ data }) {
  const chartData = Object.entries(
    data.reduce((acc, item) => {
      const q = item.quantity || 1;
      acc[item.series] = (acc[item.series] || 0) + (item.marketValue || 0) * q;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-xl font-black text-gray-800 mb-4">Value by Series</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="white"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {chartData.map((entry, index) => (
          <motion.div
            key={entry.name}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-medium text-gray-700">{entry.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function RarityBarChart({ data }) {
  const chartData = Object.entries(
    data.reduce((acc, item) => {
      const q = item.quantity || 1;
      acc[item.rarity] = (acc[item.rarity] || 0) + q;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, count: value }));

  const rarityColors = {
    'Common': '#9CA3AF',
    'Uncommon': '#10B981',
    'Rare': '#3B82F6',
    'Epic': '#8B5CF6',
    'Legendary': '#F97316',
    'Grail': '#EF4444'
  };

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-black text-gray-800 mb-4">Rarity Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: '#374151', fontWeight: 600 }}
              width={80}
            />
            <Tooltip content={<CustomCountTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[0, 10, 10, 0]}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={rarityColors[entry.name] || COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function ValueTrendChart({ data }) {
  // Create mock historical data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const totalValue = data.reduce((sum, item) => sum + (item.marketValue || 0) * (item.quantity || 1), 0);
  
  const trendData = months.map((month, index) => ({
    month,
    value: totalValue * (0.7 + (index * 0.06) + Math.random() * 0.1)
  }));

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-xl font-black text-gray-800 mb-4">Collection Value Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00AEEF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
            <YAxis tick={{ fill: '#6B7280' }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00AEEF"
              strokeWidth={3}
              fill="url(#valueGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}