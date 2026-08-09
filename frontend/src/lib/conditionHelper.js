export const BOX_CONDITIONS = [
  'Mint (9.5-10)',
  'Near Mint (8.5-9)',
  'Very Good (7-8)',
  'Damaged (6-)'
];

export const getConditionMultiplier = (condition) => {
  return 1.0;
};

export const getConditionBadgeStyle = (condition) => {
  if (!condition) return 'bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700';
  const c = String(condition).toLowerCase();
  if (c.includes('damaged') || c.includes('6-')) {
    return 'bg-red-100 text-red-800 border-red-400 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
  }
  if (c.includes('very good') || c.includes('7-8')) {
    return 'bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700';
  }
  if (c.includes('near mint') || c.includes('8.5-9')) {
    return 'bg-cyan-100 text-cyan-800 border-cyan-400 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700';
  }
  return 'bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700';
};
