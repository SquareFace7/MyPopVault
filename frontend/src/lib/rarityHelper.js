/**
 * Helper module for standardized Rarity calculation & badge styling
 */

export const getRarityFromPrice = (marketPrice, explicitRarity) => {
  const price = typeof marketPrice === 'number' ? marketPrice : parseFloat(marketPrice) || 0;
  if (price >= 100) return 'Grail';
  if (price >= 50) return 'Legendary';
  if (price >= 25) return 'Rare';
  if (price >= 15) return 'Uncommon';
  if (explicitRarity && ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Grail'].includes(explicitRarity)) {
    return explicitRarity;
  }
  return 'Common';
};

export const RARITY_BADGE_STYLES = {
  'Common': 'bg-gray-100 text-gray-700 border-gray-300',
  'Uncommon': 'bg-green-100 text-green-700 border-green-400',
  'Rare': 'bg-blue-100 text-blue-700 border-blue-400',
  'Epic': 'bg-purple-100 text-purple-700 border-purple-400',
  'Legendary': 'bg-orange-100 text-orange-700 border-orange-400',
  'Grail': 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-black border-yellow-600 shadow-sm',
};
