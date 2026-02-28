export type BadgeCategory = 
  | 'waste-reducer'
  | 'community-helper'
  | 'water-saver'
  | 'bike-rider'
  | 'energy-hero';

export interface Quest {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  category: BadgeCategory;
  timeEstimate: string;
  points: number;
  lat: number;
  lng: number;
  badgeCategory: BadgeCategory;
  difficulty: 'easy' | 'medium' | 'hard' | 'demon';
  icon: string;
}

// Sample quests near Madison, WI
export const quests: Quest[] = [
  {
    id: '1',
    title: 'Campus Recycling Run',
    description: 'Visit the recycling center on Bascom Hill and sort recyclables into the correct bins. Help keep UW-Madison green!',
    whyItMatters: 'Proper recycling reduces landfill waste by up to 75% and conserves natural resources for future generations.',
    category: 'waste-reducer',
    timeEstimate: '10-15 min',
    points: 50,
    lat: 43.0753,
    lng: -89.4034,
    badgeCategory: 'waste-reducer',
    difficulty: 'easy',
    icon: '♻️'
  },
  {
    id: '2',
    title: 'Lake Mendota Cleanup',
    description: 'Join a micro-cleanup session along Lake Mendota shore. Collect at least 5 pieces of litter near Memorial Union Terrace.',
    whyItMatters: 'Keeping our lakes clean protects local wildlife and preserves Madison\'s beautiful waterways for everyone to enjoy.',
    category: 'community-helper',
    timeEstimate: '15-20 min',
    points: 75,
    lat: 43.0766,
    lng: -89.4001,
    badgeCategory: 'community-helper',
    difficulty: 'medium',
    icon: '🌊'
  },
  {
    id: '3',
    title: 'Water Bottle Refill Challenge',
    description: 'Find and use 3 water refill stations around the Capitol Square instead of buying plastic bottles.',
    whyItMatters: 'Americans use 50 billion plastic water bottles per year. Using refill stations saves money and reduces plastic waste.',
    category: 'water-saver',
    timeEstimate: '20-30 min',
    points: 60,
    lat: 43.0747,
    lng: -89.3840,
    badgeCategory: 'water-saver',
    difficulty: 'easy',
    icon: '💧'
  },
  {
    id: '4',
    title: 'State Street Bike Tour',
    description: 'Rent a BCycle and ride down State Street from the Capitol to campus. Snap a photo at Library Mall!',
    whyItMatters: 'Biking instead of driving reduces CO2 emissions and traffic congestion while keeping you healthy.',
    category: 'bike-rider',
    timeEstimate: '15-20 min',
    points: 80,
    lat: 43.0731,
    lng: -89.3964,
    badgeCategory: 'bike-rider',
    difficulty: 'easy',
    icon: '🚴'
  },
  {
    id: '5',
    title: 'Energy Audit Explorer',
    description: 'Visit the Wisconsin Energy Institute and learn about renewable energy. Take notes on 3 energy-saving tips.',
    whyItMatters: 'Understanding energy consumption helps us make smarter choices and reduce our carbon footprint.',
    category: 'energy-hero',
    timeEstimate: '25-30 min',
    points: 100,
    lat: 43.0722,
    lng: -89.4112,
    badgeCategory: 'energy-hero',
    difficulty: 'hard',
    icon: '⚡'
  },
  {
    id: '6',
    title: 'Farmer\'s Market Zero Waste',
    description: 'Visit the Dane County Farmers\' Market with reusable bags. Buy local produce and refuse plastic bags!',
    whyItMatters: 'Supporting local farmers reduces food transportation emissions and strengthens our community economy.',
    category: 'waste-reducer',
    timeEstimate: '30-45 min',
    points: 90,
    lat: 43.0747,
    lng: -89.3840,
    badgeCategory: 'waste-reducer',
    difficulty: 'medium',
    icon: '🥕'
  },
  {
    id: '7',
    title: 'Arboretum Nature Walk',
    description: 'Take a mindful walk through UW Arboretum. Identify 5 native plant species and log them in your notes.',
    whyItMatters: 'Connecting with nature builds environmental awareness and appreciation for local ecosystems.',
    category: 'community-helper',
    timeEstimate: '30-40 min',
    points: 70,
    lat: 43.0422,
    lng: -89.4277,
    badgeCategory: 'community-helper',
    difficulty: 'medium',
    icon: '🌿'
  },
  {
    id: '8',
    title: 'Lights Out Challenge',
    description: 'Walk through campus buildings and report any lights left on in empty rooms to facilities management.',
    whyItMatters: 'Turning off unused lights can save up to 10% of a building\'s electricity consumption.',
    category: 'energy-hero',
    timeEstimate: '10-15 min',
    points: 45,
    lat: 43.0753,
    lng: -89.4034,
    badgeCategory: 'energy-hero',
    difficulty: 'easy',
    icon: '💡'
  }
];

export function getQuestById(id: string): Quest | undefined {
  return quests.find(quest => quest.id === id);
}

export function getQuestsByCategory(category: BadgeCategory): Quest[] {
  return quests.filter(quest => quest.category === category);
}
