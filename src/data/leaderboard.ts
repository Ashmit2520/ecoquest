export interface LeaderboardUser {
  rank: number;
  username: string;
  points: number;
  avatar: string;
  change: 'up' | 'down' | 'same';
  changeAmount?: number;
}

// Global leaderboard data (all-time top users)
export const globalLeaderboardAllTime: LeaderboardUser[] = [
  { rank: 1, username: 'EcoChampion42', points: 15420, avatar: '🦊', change: 'same' },
  { rank: 2, username: 'GreenWarrior', points: 12850, avatar: '🐼', change: 'up', changeAmount: 1 },
  { rank: 3, username: 'NatureLover99', points: 11200, avatar: '🦋', change: 'down', changeAmount: 1 },
  { rank: 4, username: 'SustainableSteph', points: 9870, avatar: '🌻', change: 'up', changeAmount: 2 },
  { rank: 5, username: 'BikeRiderMax', points: 8540, avatar: '🚴', change: 'same' },
  { rank: 6, username: 'RecycleQueen', points: 7920, avatar: '♻️', change: 'up', changeAmount: 3 },
  { rank: 7, username: 'TreeHugger101', points: 7450, avatar: '🌲', change: 'down', changeAmount: 2 },
  { rank: 8, username: 'OceanSaver', points: 6890, avatar: '🐳', change: 'same' },
  { rank: 9, username: 'EarthFirst', points: 6320, avatar: '🌍', change: 'up', changeAmount: 1 },
  { rank: 10, username: 'CleanAirKid', points: 5980, avatar: '💨', change: 'down', changeAmount: 1 },
];

export const globalLeaderboardWeekly: LeaderboardUser[] = [
  { rank: 1, username: 'SpeedyEco', points: 890, avatar: '⚡', change: 'up', changeAmount: 4 },
  { rank: 2, username: 'WeekendWarrior', points: 720, avatar: '🦸', change: 'up', changeAmount: 2 },
  { rank: 3, username: 'GreenWarrior', points: 650, avatar: '🐼', change: 'same' },
  { rank: 4, username: 'EcoChampion42', points: 580, avatar: '🦊', change: 'down', changeAmount: 3 },
  { rank: 5, username: 'NatureLover99', points: 520, avatar: '🦋', change: 'up', changeAmount: 1 },
  { rank: 6, username: 'NewbieStar', points: 480, avatar: '⭐', change: 'up', changeAmount: 8 },
  { rank: 7, username: 'CommuterPro', points: 420, avatar: '🚌', change: 'down', changeAmount: 2 },
  { rank: 8, username: 'SustainableSteph', points: 380, avatar: '🌻', change: 'same' },
  { rank: 9, username: 'ZeroWasteZoe', points: 340, avatar: '🗑️', change: 'up', changeAmount: 3 },
  { rank: 10, username: 'BikeRiderMax', points: 290, avatar: '🚴', change: 'down', changeAmount: 4 },
];

export const globalLeaderboardMonthly: LeaderboardUser[] = [
  { rank: 1, username: 'EcoChampion42', points: 2840, avatar: '🦊', change: 'same' },
  { rank: 2, username: 'GreenWarrior', points: 2560, avatar: '🐼', change: 'up', changeAmount: 1 },
  { rank: 3, username: 'SustainableSteph', points: 2180, avatar: '🌻', change: 'up', changeAmount: 3 },
  { rank: 4, username: 'NatureLover99', points: 1920, avatar: '🦋', change: 'down', changeAmount: 2 },
  { rank: 5, username: 'SpeedyEco', points: 1750, avatar: '⚡', change: 'up', changeAmount: 6 },
  { rank: 6, username: 'BikeRiderMax', points: 1580, avatar: '🚴', change: 'down', changeAmount: 1 },
  { rank: 7, username: 'RecycleQueen', points: 1420, avatar: '♻️', change: 'same' },
  { rank: 8, username: 'TreeHugger101', points: 1290, avatar: '🌲', change: 'down', changeAmount: 1 },
  { rank: 9, username: 'OceanSaver', points: 1150, avatar: '🐳', change: 'up', changeAmount: 2 },
  { rank: 10, username: 'WeekendWarrior', points: 980, avatar: '🦸', change: 'up', changeAmount: 4 },
];

// Local leaderboard data (Madison, WI area)
export const localLeaderboardAllTime: LeaderboardUser[] = [
  { rank: 1, username: 'MadisonPride', points: 8920, avatar: '🏛️', change: 'same' },
  { rank: 2, username: 'BadgerEco', points: 7650, avatar: '🦡', change: 'up', changeAmount: 1 },
  { rank: 3, username: 'LakeMendotaFan', points: 6840, avatar: '🌊', change: 'same' },
  { rank: 4, username: 'StateStBiker', points: 5920, avatar: '🚲', change: 'up', changeAmount: 2 },
  { rank: 5, username: 'CapitolCleanup', points: 5340, avatar: '🏛️', change: 'down', changeAmount: 2 },
  { rank: 6, username: 'UWGreen', points: 4780, avatar: '📚', change: 'up', changeAmount: 1 },
  { rank: 7, username: 'IsthmusEco', points: 4250, avatar: '🌉', change: 'same' },
  { rank: 8, username: 'ArboretumWalker', points: 3890, avatar: '🌳', change: 'down', changeAmount: 2 },
  { rank: 9, username: 'WillyStFarmer', points: 3420, avatar: '🥕', change: 'up', changeAmount: 3 },
  { rank: 10, username: 'MonoLakeLover', points: 2980, avatar: '🦆', change: 'down', changeAmount: 1 },
];

export const localLeaderboardWeekly: LeaderboardUser[] = [
  { rank: 1, username: 'StateStBiker', points: 520, avatar: '🚲', change: 'up', changeAmount: 3 },
  { rank: 2, username: 'BadgerEco', points: 480, avatar: '🦡', change: 'up', changeAmount: 1 },
  { rank: 3, username: 'NewbieExplorer', points: 420, avatar: '🔍', change: 'up', changeAmount: 7 },
  { rank: 4, username: 'MadisonPride', points: 380, avatar: '🏛️', change: 'down', changeAmount: 3 },
  { rank: 5, username: 'UWGreen', points: 340, avatar: '📚', change: 'same' },
  { rank: 6, username: 'WillyStFarmer', points: 290, avatar: '🥕', change: 'up', changeAmount: 4 },
  { rank: 7, username: 'LakeMendotaFan', points: 250, avatar: '🌊', change: 'down', changeAmount: 4 },
  { rank: 8, username: 'CapitolCleanup', points: 210, avatar: '🏛️', change: 'down', changeAmount: 2 },
  { rank: 9, username: 'IsthmusEco', points: 180, avatar: '🌉', change: 'same' },
  { rank: 10, username: 'ArboretumWalker', points: 140, avatar: '🌳', change: 'down', changeAmount: 1 },
];

export const localLeaderboardMonthly: LeaderboardUser[] = [
  { rank: 1, username: 'MadisonPride', points: 1650, avatar: '🏛️', change: 'same' },
  { rank: 2, username: 'BadgerEco', points: 1420, avatar: '🦡', change: 'up', changeAmount: 1 },
  { rank: 3, username: 'StateStBiker', points: 1280, avatar: '🚲', change: 'up', changeAmount: 2 },
  { rank: 4, username: 'LakeMendotaFan', points: 1150, avatar: '🌊', change: 'down', changeAmount: 2 },
  { rank: 5, username: 'UWGreen', points: 980, avatar: '📚', change: 'up', changeAmount: 1 },
  { rank: 6, username: 'CapitolCleanup', points: 820, avatar: '🏛️', change: 'down', changeAmount: 1 },
  { rank: 7, username: 'WillyStFarmer', points: 720, avatar: '🥕', change: 'up', changeAmount: 3 },
  { rank: 8, username: 'IsthmusEco', points: 650, avatar: '🌉', change: 'down', changeAmount: 1 },
  { rank: 9, username: 'ArboretumWalker', points: 580, avatar: '🌳', change: 'same' },
  { rank: 10, username: 'NewbieExplorer', points: 490, avatar: '🔍', change: 'up', changeAmount: 5 },
];

export type TimeRange = 'week' | 'month' | 'all';
export type LeaderboardType = 'global' | 'local';

export function getLeaderboard(type: LeaderboardType, range: TimeRange): LeaderboardUser[] {
  if (type === 'global') {
    switch (range) {
      case 'week': return globalLeaderboardWeekly;
      case 'month': return globalLeaderboardMonthly;
      default: return globalLeaderboardAllTime;
    }
  } else {
    switch (range) {
      case 'week': return localLeaderboardWeekly;
      case 'month': return localLeaderboardMonthly;
      default: return localLeaderboardAllTime;
    }
  }
}
