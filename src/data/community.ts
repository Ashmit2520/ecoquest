export interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  lumaReactions: number;
  comments: Comment[];
  tags?: string[];
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Thread {
  id: string;
  name: string;
  icon: string;
  unread: number;
  lastMessage: string;
  isChannel: boolean;
}

export const threads: Thread[] = [
  { id: 'general', name: 'General', icon: '💬', unread: 3, lastMessage: 'Anyone doing the park cleanup?', isChannel: true },
  { id: 'challenges', name: 'Challenges', icon: '🎯', unread: 5, lastMessage: 'New demon quest dropped!', isChannel: true },
  { id: 'tips', name: 'Eco Tips', icon: '💡', unread: 0, lastMessage: 'Try bamboo toothbrushes!', isChannel: true },
  { id: 'achievements', name: 'Achievements', icon: '🏆', unread: 12, lastMessage: 'Just hit 10k points!', isChannel: true },
  { id: 'local-madison', name: 'Madison WI', icon: '🏛️', unread: 2, lastMessage: 'Lake Mendota cleanup Sat', isChannel: true },
];

export const directMessages: Thread[] = [
  { id: 'dm-eco42', name: 'EcoChampion42', icon: '🦊', unread: 1, lastMessage: 'Nice job on that quest!', isChannel: false },
  { id: 'dm-green', name: 'GreenWarrior', icon: '🐼', unread: 0, lastMessage: 'Thanks for the tip!', isChannel: false },
  { id: 'dm-nature', name: 'NatureLover99', icon: '🦋', unread: 0, lastMessage: 'See you at the event!', isChannel: false },
];

export const communityPosts: Post[] = [
  {
    id: '1',
    author: 'EcoChampion42',
    avatar: '🦊',
    content: 'Just completed the "Bike to Work Week" challenge! 🚴‍♀️ Saved 15kg of CO2 this week alone. Who else is crushing their commute goals?',
    timestamp: '2 hours ago',
    likes: 24,
    lumaReactions: 150,
    tags: ['biking', 'commute', 'challenge'],
    comments: [
      { id: 'c1', author: 'GreenWarrior', avatar: '🐼', content: 'Amazing! I\'m on day 3 of my streak!', timestamp: '1 hour ago', likes: 5 },
      { id: 'c2', author: 'BikeRiderMax', avatar: '🚴', content: 'The weather has been perfect for it!', timestamp: '45 min ago', likes: 3 },
    ]
  },
  {
    id: '2',
    author: 'SustainableSteph',
    avatar: '🌻',
    content: 'Pro tip: Bring a reusable bag on your quest walks! I found 3 pieces of litter on my way to the recycling center quest today and was able to properly dispose of them. Double impact! 💚',
    timestamp: '4 hours ago',
    likes: 42,
    lumaReactions: 200,
    tags: ['tips', 'recycling', 'cleanup'],
    comments: [
      { id: 'c3', author: 'RecycleQueen', avatar: '♻️', content: 'I always keep one in my bag now!', timestamp: '3 hours ago', likes: 8 },
    ]
  },
  {
    id: '3',
    author: 'TreeHugger101',
    avatar: '🌲',
    content: 'The new Demon difficulty park cleanup quest is NO JOKE! 🔥 Took me 2 hours but got 500 points and 100 Luma coins. Worth it if you have the time!',
    image: '/quest-complete.png',
    timestamp: '6 hours ago',
    likes: 67,
    lumaReactions: 350,
    tags: ['demon', 'cleanup', 'challenge'],
    comments: [
      { id: 'c4', author: 'EcoChampion42', avatar: '🦊', content: 'Respect! That one is brutal.', timestamp: '5 hours ago', likes: 12 },
      { id: 'c5', author: 'NatureLover99', avatar: '🦋', content: 'How many bags did you fill?', timestamp: '4 hours ago', likes: 4 },
      { id: 'c6', author: 'TreeHugger101', avatar: '🌲', content: '@NatureLover99 Four full bags!', timestamp: '4 hours ago', likes: 6 },
    ]
  },
  {
    id: '4',
    author: 'OceanSaver',
    avatar: '🐳',
    content: 'Anyone else think we should organize a community beach/lake cleanup event? I\'d love to meet some fellow EcoQuesters IRL! 🌊',
    timestamp: '8 hours ago',
    likes: 89,
    lumaReactions: 420,
    tags: ['event', 'community', 'cleanup'],
    comments: [
      { id: 'c7', author: 'LakeMendotaFan', avatar: '🌊', content: 'Count me in! Lake Mendota could use some love.', timestamp: '7 hours ago', likes: 15 },
      { id: 'c8', author: 'MadisonPride', avatar: '🏛️', content: 'I can help coordinate for the Madison area!', timestamp: '6 hours ago', likes: 11 },
      { id: 'c9', author: 'BadgerEco', avatar: '🦡', content: 'Let\'s do it this Saturday!', timestamp: '5 hours ago', likes: 9 },
    ]
  },
  {
    id: '5',
    author: 'NewbieStar',
    avatar: '⭐',
    content: 'Just started EcoQuest yesterday and I\'m already hooked! Completed my first 3 quests and earned enough for my first skin. This app makes being eco-friendly actually fun! 🎮💚',
    timestamp: '12 hours ago',
    likes: 156,
    lumaReactions: 500,
    tags: ['newbie', 'welcome'],
    comments: [
      { id: 'c10', author: 'EcoChampion42', avatar: '🦊', content: 'Welcome to the community! Pro tip: the farmers market quest is great for beginners.', timestamp: '11 hours ago', likes: 22 },
      { id: 'c11', author: 'GreenWarrior', avatar: '🐼', content: 'Welcome! Feel free to ask questions here anytime.', timestamp: '10 hours ago', likes: 18 },
    ]
  },
];

export const myStats = {
  postsCreated: 12,
  likesReceived: 234,
  lumaGiven: 1500,
  commentsCount: 45,
};
