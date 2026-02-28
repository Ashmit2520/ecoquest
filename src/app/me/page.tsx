'use client';

import { useState, useEffect } from 'react';
import { badges, UserBadgeProgress, initialBadgeProgress, getBadgeById } from '../../data/badges';
import { quests } from '../../data/quests';
import { inventoryItems, InventoryItem, rarityColors, categoryLabels, getItemsByCategory, getItemsByRarity } from '../../data/inventory';
import BadgeCard from '../../components/BadgeCard';
import { useAuth } from '../../context/AuthContext';

type InventoryCategory = 'all' | 'skins' | 'badges' | 'boosters' | 'seasonal';

export default function ProfilePage() {
  const { user, lumaCoins, spendLumaCoins } = useAuth();
  const [badgeProgress, setBadgeProgress] = useState<UserBadgeProgress[]>(initialBadgeProgress);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<InventoryCategory>('all');
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [equippedSkin, setEquippedSkin] = useState<string>('default-fox');
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [completionHistory, setCompletionHistory] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    // Load badge progress from localStorage
    const savedProgress = localStorage.getItem('ecoquest_badge_progress');
    if (savedProgress) {
      setBadgeProgress(JSON.parse(savedProgress));
    }

    // Load total points
    const savedPoints = localStorage.getItem('ecoquest_total_points');
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints));
    }

    // Load completed quests count
    const savedCompleted = localStorage.getItem('ecoquest_completed');
    if (savedCompleted) {
      setCompletedCount(JSON.parse(savedCompleted).length);
    }

    // Load owned items
    const savedOwned = localStorage.getItem('ecoquest_owned_items');
    if (savedOwned) {
      setOwnedItems(JSON.parse(savedOwned));
    } else {
      // Default owned items
      setOwnedItems(['default-fox', 'first-steps']);
    }

    // Load equipped skin
    const savedSkin = localStorage.getItem('ecoquest_equipped_skin');
    if (savedSkin) {
      setEquippedSkin(savedSkin);
    }

    // Load completion history
    const savedHistory = localStorage.getItem('ecoquest_completion_history');
    if (savedHistory) {
      setCompletionHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleUnlock = (item: InventoryItem) => {
    if (lumaCoins >= item.cost && !ownedItems.includes(item.id)) {
      spendLumaCoins(item.cost);
      const newOwned = [...ownedItems, item.id];
      setOwnedItems(newOwned);
      localStorage.setItem('ecoquest_owned_items', JSON.stringify(newOwned));
      setShowUnlockAnimation(item.id);
      setTimeout(() => setShowUnlockAnimation(null), 1500);
    }
  };

  const handleEquip = (itemId: string) => {
    if (ownedItems.includes(itemId)) {
      setEquippedSkin(itemId);
      localStorage.setItem('ecoquest_equipped_skin', itemId);
    }
  };

  const getFilteredItems = (): InventoryItem[] => {
    if (activeCategory === 'all') return inventoryItems;
    return getItemsByCategory(activeCategory);
  };

  const totalQuestsAvailable = quests.length;
  const completionPercentage = Math.round((completedCount / totalQuestsAvailable) * 100);

  // Group items by rarity for display (Common → Rare → Legendary)
  const groupedItems = {
    common: getFilteredItems().filter(i => i.rarity === 'common'),
    rare: getFilteredItems().filter(i => i.rarity === 'rare'),
    legendary: getFilteredItems().filter(i => i.rarity === 'legendary'),
  };

  // Calculate total badge levels
  const totalBadgeLevels = badgeProgress.reduce((acc, p) => acc + p.currentLevel, 0);
  const maxBadgeLevels = badges.length * 3; // 5 badges × 3 levels each

  // Get equipped skin icon
  const equippedSkinItem = inventoryItems.find(i => i.id === equippedSkin);
  const avatarIcon = equippedSkinItem?.icon || '🦊';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-eco-green to-eco-green-dark rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-xl overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* Large Avatar with equipped skin */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-6xl border-4 border-white/30 transition-transform group-hover:scale-105 animate-[fox-idle_3s_ease-in-out_infinite]">
              {avatarIcon}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-yellow-900 border-2 border-white shadow-lg">
              {totalBadgeLevels}
            </div>
            {/* Luma coins display */}
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg animate-[coin-bounce_2s_ease-in-out_infinite]">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold text-yellow-900">{lumaCoins}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{user?.username || 'Eco Warrior'}</h1>
            <p className="text-white/80 mb-4">Making Madison greener, one quest at a time! 🌍</p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/20 transition-colors">
                <div className="text-2xl font-bold">{totalPoints}</div>
                <div className="text-xs text-white/70">Total Points</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/20 transition-colors">
                <div className="text-2xl font-bold">{completedCount}/{totalQuestsAvailable}</div>
                <div className="text-xs text-white/70">Quests Done</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/20 transition-colors">
                <div className="text-2xl font-bold">{ownedItems.length}/{inventoryItems.length}</div>
                <div className="text-xs text-white/70">Items Owned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-6 pt-6 border-t border-white/20 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/80">Overall Progress</span>
            <span className="text-sm font-semibold">{completionPercentage}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white to-green-200 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Activity Calendar Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Activity Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              ◀
            </button>
            <span className="text-sm font-medium text-gray-700">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              ▶
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const today = new Date();
              
              const days = [];
              
              // Empty cells for days before the first of the month
              for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${i}`} className="h-8" />);
              }
              
              // Days of the month
              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasCompletion = completionHistory.includes(dateStr);
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                
                days.push(
                  <div
                    key={day}
                    className={`h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                      hasCompletion
                        ? 'bg-orange-400 text-white font-medium'
                        : isToday
                          ? 'bg-eco-green/10 text-eco-green font-medium ring-1 ring-eco-green'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={hasCompletion ? 'Quest completed!' : undefined}
                  >
                    {day}
                  </div>
                );
              }
              
              return days;
            })()}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-400" />
              Quest Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-eco-green/20 ring-1 ring-eco-green" />
              Today
            </span>
          </div>
        </div>
      </div>

      {/* Collectible Items Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            Collectibles
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-yellow-500">🪙</span>
              {lumaCoins} Luma
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'skins', 'badges', 'boosters', 'seasonal'] as InventoryCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-eco-green text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? '🎁 All' : `${categoryLabels[cat].icon} ${categoryLabels[cat].name}`}
            </button>
          ))}
        </div>

        {/* Items Grid by Rarity */}
        {Object.entries(groupedItems).map(([rarity, items]) => {
          if (items.length === 0) return null;
          const colors = rarityColors[rarity as keyof typeof rarityColors];
          
          return (
            <div key={rarity} className="mb-6">
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${colors.text}`}>
                <span className={`w-2 h-2 rounded-full ${colors.bg}`} />
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)} ({items.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item) => {
                  const isOwned = ownedItems.includes(item.id);
                  const isEquipped = item.category === 'skins' && equippedSkin === item.id;
                  const canAfford = lumaCoins >= item.cost;
                  const isUnlocking = showUnlockAnimation === item.id;
                  
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                        isOwned
                          ? `${colors.border} ${colors.bg.replace('500', '50')} bg-opacity-30`
                          : 'border-gray-200 bg-gray-50'
                      } ${
                        isEquipped ? 'ring-2 ring-eco-green ring-offset-2' : ''
                      } ${
                        isUnlocking ? 'animate-[unlock-pop_0.5s_ease-out]' : ''
                      } ${
                        hoveredItem === item.id ? 'scale-105 shadow-lg z-10' : ''
                      } ${
                        rarity === 'legendary' ? 'animate-[legendary-glow_2s_ease-in-out_infinite]' : ''
                      }`}
                    >
                      {/* Locked overlay - only show when can't afford */}
                      {!isOwned && !canAfford && (
                        <div className="absolute inset-0 bg-gray-900/50 rounded-2xl flex items-center justify-center backdrop-blur-[1px] z-10">
                          <span className="text-2xl">🔒</span>
                        </div>
                      )}
                      
                      {/* Equipped badge */}
                      {isEquipped && (
                        <div className="absolute -top-2 -right-2 bg-eco-green text-white text-xs px-2 py-1 rounded-full font-medium shadow">
                          Equipped
                        </div>
                      )}
                      
                      {/* Item content */}
                      <div className="text-center">
                        <div className={`text-4xl mb-2 ${!isOwned && !canAfford ? 'grayscale opacity-50' : ''}`}>
                          {item.icon}
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                        <p className={`text-xs ${colors.text}`}>{item.category}</p>
                      </div>
                      
                      {/* Action button */}
                      <div className="mt-3">
                        {isOwned ? (
                          item.category === 'skins' && !isEquipped ? (
                            <button
                              onClick={() => handleEquip(item.id)}
                              className="w-full py-1.5 px-3 bg-eco-green text-white text-xs font-medium rounded-lg hover:bg-eco-green-dark transition-colors"
                            >
                              Equip
                            </button>
                          ) : (
                            <span className="block text-center text-xs text-gray-500 py-1.5">
                              {item.category === 'skins' ? 'Equipped ✓' : 'Owned ✓'}
                            </span>
                          )
                        ) : (
                          <button
                            onClick={() => handleUnlock(item)}
                            disabled={!canAfford}
                            className={`w-full py-1.5 px-3 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-all ${
                              canAfford
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 hover:shadow-md'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <span>🪙</span>
                            <span>{item.cost}</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Hover tooltip */}
                      {hoveredItem === item.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl z-20 w-48 pointer-events-none">
                          <p className="font-medium mb-1">{item.name}</p>
                          <p className="text-gray-300">{item.description}</p>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sustainability Badges Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🏅</span>
            Sustainability Badges
          </h2>
          <span className="text-sm text-gray-500">
            {badgeProgress.filter(p => p.currentLevel > 1).length} badges leveled up
          </span>
        </div>

        {/* Badge Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const progress = badgeProgress.find(p => p.badgeId === badge.id) || {
              badgeId: badge.id,
              currentLevel: 1,
              currentPoints: 0,
              totalQuestsCompleted: 0
            };
            return (
              <BadgeCard 
                key={badge.id} 
                badge={badge} 
                progress={progress}
              />
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          Badge Progress Overview
        </h2>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {badges.map((badge) => {
              const progress = badgeProgress.find(p => p.badgeId === badge.id);
              if (!progress) return null;

              const percentage = Math.min(100, Math.round((progress.currentPoints / 250) * 100));

              return (
                <div key={badge.id} className="p-4 flex items-center gap-4">
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${badge.color}`}>{badge.name}</span>
                      <span className="text-sm text-gray-500">Level {progress.currentLevel}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${badge.bgColor.replace('bg-', 'bg-')}`}
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: badge.color.includes('green') ? '#22c55e' :
                                          badge.color.includes('purple') ? '#a855f7' :
                                          badge.color.includes('blue') ? '#0ea5e9' :
                                          badge.color.includes('orange') ? '#f97316' :
                                          '#eab308'
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{progress.currentPoints}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-blue-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          Pro Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-eco-green mt-0.5">•</span>
            <span>Complete quests in the same category to level up badges faster!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-eco-green mt-0.5">•</span>
            <span>Each badge has 3 levels. Reach Level 3 to become a true Sustainability Champion!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-eco-green mt-0.5">•</span>
            <span>Check the map regularly for new quests near you.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
