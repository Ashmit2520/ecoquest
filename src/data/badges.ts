import { BadgeCategory } from './quests';

export interface Badge {
  id: BadgeCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  levels: BadgeLevel[];
}

export interface BadgeLevel {
  level: number;
  name: string;
  threshold: number; // Points needed to reach this level
  icon: string;
}

export interface UserBadgeProgress {
  badgeId: BadgeCategory;
  currentLevel: number;
  currentPoints: number;
  totalQuestsCompleted: number;
}

export const badges: Badge[] = [
  {
    id: 'waste-reducer',
    name: 'Waste Reducer',
    description: 'Champion of recycling and zero-waste living',
    icon: '♻️',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    levels: [
      { level: 1, name: 'Recycling Rookie', threshold: 0, icon: '🌱' },
      { level: 2, name: 'Waste Warrior', threshold: 100, icon: '♻️' },
      { level: 3, name: 'Zero Waste Hero', threshold: 250, icon: '🏆' }
    ]
  },
  {
    id: 'community-helper',
    name: 'Community Helper',
    description: 'Dedicated to making our community cleaner and stronger',
    icon: '🤝',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    levels: [
      { level: 1, name: 'Helping Hand', threshold: 0, icon: '👋' },
      { level: 2, name: 'Community Champion', threshold: 100, icon: '🤝' },
      { level: 3, name: 'Local Legend', threshold: 250, icon: '⭐' }
    ]
  },
  {
    id: 'water-saver',
    name: 'Water Saver',
    description: 'Protector of our precious water resources',
    icon: '💧',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    levels: [
      { level: 1, name: 'Water Watcher', threshold: 0, icon: '💧' },
      { level: 2, name: 'Stream Guardian', threshold: 100, icon: '🌊' },
      { level: 3, name: 'Aqua Champion', threshold: 250, icon: '🐳' }
    ]
  },
  {
    id: 'bike-rider',
    name: 'Bike Rider',
    description: 'Eco-friendly transportation advocate',
    icon: '🚴',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    levels: [
      { level: 1, name: 'Pedal Pusher', threshold: 0, icon: '🚲' },
      { level: 2, name: 'Cycle Star', threshold: 100, icon: '🚴' },
      { level: 3, name: 'Velocity Master', threshold: 250, icon: '🏅' }
    ]
  },
  {
    id: 'energy-hero',
    name: 'Energy Hero',
    description: 'Committed to energy conservation and efficiency',
    icon: '⚡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    levels: [
      { level: 1, name: 'Power Saver', threshold: 0, icon: '💡' },
      { level: 2, name: 'Energy Expert', threshold: 100, icon: '⚡' },
      { level: 3, name: 'Sustainability Sage', threshold: 250, icon: '☀️' }
    ]
  }
];

export function getBadgeById(id: BadgeCategory): Badge | undefined {
  return badges.find(badge => badge.id === id);
}

export function getCurrentLevel(badge: Badge, points: number): BadgeLevel {
  let currentLevel = badge.levels[0];
  for (const level of badge.levels) {
    if (points >= level.threshold) {
      currentLevel = level;
    }
  }
  return currentLevel;
}

export function getNextLevel(badge: Badge, points: number): BadgeLevel | null {
  const sortedLevels = [...badge.levels].sort((a, b) => a.threshold - b.threshold);
  for (const level of sortedLevels) {
    if (points < level.threshold) {
      return level;
    }
  }
  return null;
}

export function getProgressToNextLevel(badge: Badge, points: number): { current: number; needed: number; percentage: number } {
  const currentLevel = getCurrentLevel(badge, points);
  const nextLevel = getNextLevel(badge, points);
  
  if (!nextLevel) {
    return { current: points, needed: points, percentage: 100 };
  }
  
  const currentThreshold = currentLevel.threshold;
  const nextThreshold = nextLevel.threshold;
  const pointsInLevel = points - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const percentage = Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100));
  
  return { current: pointsInLevel, needed: pointsNeeded, percentage };
}

// Initial progress (all badges start at 0)
export const initialBadgeProgress: UserBadgeProgress[] = [
  { badgeId: 'waste-reducer', currentLevel: 1, currentPoints: 0, totalQuestsCompleted: 0 },
  { badgeId: 'community-helper', currentLevel: 1, currentPoints: 0, totalQuestsCompleted: 0 },
  { badgeId: 'water-saver', currentLevel: 1, currentPoints: 0, totalQuestsCompleted: 0 },
  { badgeId: 'bike-rider', currentLevel: 1, currentPoints: 0, totalQuestsCompleted: 0 },
  { badgeId: 'energy-hero', currentLevel: 1, currentPoints: 0, totalQuestsCompleted: 0 }
];
