export type ItemRarity = 'common' | 'rare' | 'legendary';
export type ItemCategory = 'skins' | 'badges' | 'boosters' | 'seasonal';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ItemCategory;
  rarity: ItemRarity;
  cost: number; // Luma coins required to unlock
  unlocked?: boolean;
}

export const inventoryItems: InventoryItem[] = [
  // Skins
  {
    id: 'skin-forest',
    name: 'Forest Guardian',
    description: 'A mystical forest-themed avatar skin',
    icon: '🌲',
    category: 'skins',
    rarity: 'common',
    cost: 100
  },
  {
    id: 'skin-ocean',
    name: 'Ocean Protector',
    description: 'Dive deep with this aquatic-themed skin',
    icon: '🐚',
    category: 'skins',
    rarity: 'common',
    cost: 100
  },
  {
    id: 'skin-solar',
    name: 'Solar Warrior',
    description: 'Harness the power of the sun',
    icon: '☀️',
    category: 'skins',
    rarity: 'rare',
    cost: 300
  },
  {
    id: 'skin-aurora',
    name: 'Aurora Spirit',
    description: 'Dance with the northern lights',
    icon: '🌌',
    category: 'skins',
    rarity: 'legendary',
    cost: 750
  },

  // Badges
  {
    id: 'badge-early',
    name: 'Early Adopter',
    description: 'One of the first EcoQuest pioneers',
    icon: '🏅',
    category: 'badges',
    rarity: 'rare',
    cost: 0 // Free for early users
  },
  {
    id: 'badge-streak',
    name: '7-Day Streak',
    description: 'Completed quests 7 days in a row',
    icon: '🔥',
    category: 'badges',
    rarity: 'common',
    cost: 150
  },
  {
    id: 'badge-perfect',
    name: 'Perfectionist',
    description: 'Completed all quests in a category',
    icon: '💎',
    category: 'badges',
    rarity: 'legendary',
    cost: 500
  },
  {
    id: 'badge-social',
    name: 'Social Butterfly',
    description: 'Engaged with 50 community posts',
    icon: '🦋',
    category: 'badges',
    rarity: 'rare',
    cost: 250
  },

  // Boosters
  {
    id: 'booster-2x',
    name: '2x Points',
    description: 'Double points for the next quest',
    icon: '⚡',
    category: 'boosters',
    rarity: 'common',
    cost: 50
  },
  {
    id: 'booster-time',
    name: 'Time Extender',
    description: 'Extra time for quest completion',
    icon: '⏰',
    category: 'boosters',
    rarity: 'common',
    cost: 75
  },
  {
    id: 'booster-coin',
    name: 'Coin Magnet',
    description: 'Earn bonus Luma coins on completion',
    icon: '🧲',
    category: 'boosters',
    rarity: 'rare',
    cost: 200
  },

  // Seasonal
  {
    id: 'seasonal-spring',
    name: 'Spring Bloom',
    description: 'Limited edition spring collectible',
    icon: '🌸',
    category: 'seasonal',
    rarity: 'rare',
    cost: 400
  },
  {
    id: 'seasonal-earth',
    name: 'Earth Day Champion',
    description: 'Exclusive Earth Day 2026 item',
    icon: '🌍',
    category: 'seasonal',
    rarity: 'legendary',
    cost: 1000
  },
  {
    id: 'seasonal-winter',
    name: 'Winter Frost',
    description: 'Rare winter holiday collectible',
    icon: '❄️',
    category: 'seasonal',
    rarity: 'legendary',
    cost: 800
  }
];

export const rarityColors: Record<ItemRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-600',
    glow: ''
  },
  rare: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-600',
    glow: 'shadow-blue-200'
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-100 to-orange-100',
    border: 'border-amber-400',
    text: 'text-amber-600',
    glow: 'shadow-lg shadow-amber-200 animate-pulse-glow'
  }
};

export const categoryLabels: Record<ItemCategory, { name: string; icon: string }> = {
  skins: { name: 'Skins', icon: '👤' },
  badges: { name: 'Badges', icon: '🏅' },
  boosters: { name: 'Boosters', icon: '⚡' },
  seasonal: { name: 'Seasonal', icon: '🎃' }
};

export function getItemsByCategory(category: ItemCategory): InventoryItem[] {
  return inventoryItems.filter(item => item.category === category);
}

export function getItemsByRarity(rarity: ItemRarity): InventoryItem[] {
  return inventoryItems.filter(item => item.rarity === rarity);
}
