'use client';

import { Badge, getCurrentLevel, getNextLevel, getProgressToNextLevel, UserBadgeProgress } from '../data/badges';

interface BadgeCardProps {
  badge: Badge;
  progress: UserBadgeProgress;
}

export default function BadgeCard({ badge, progress }: BadgeCardProps) {
  const currentLevel = getCurrentLevel(badge, progress.currentPoints);
  const nextLevel = getNextLevel(badge, progress.currentPoints);
  const progressInfo = getProgressToNextLevel(badge, progress.currentPoints);
  const isMaxLevel = !nextLevel;

  return (
    <div className={`relative p-5 rounded-2xl border-2 ${badge.borderColor} ${badge.bgColor} transition-all hover:shadow-lg`}>
      {/* Level indicator */}
      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-gray-200">
        <span className="text-sm font-bold text-gray-700">L{currentLevel.level}</span>
      </div>

      {/* Icon and name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl animate-float">
          {currentLevel.icon}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${badge.color}`}>{badge.name}</h3>
          <p className="text-sm text-gray-600">{currentLevel.name}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4">
        {badge.description}
      </p>

      {/* Progress section */}
      <div className="space-y-2 -ml-1">
        <div className="flex justify-between items-center text-sm pl-1">
          <span className="text-gray-600">
            {isMaxLevel ? 'Max Level Achieved! 🎉' : `${progressInfo.current}/${progressInfo.needed} to Level ${nextLevel.level}`}
          </span>
          <span className={`font-semibold ${badge.color}`}>
            {progress.currentPoints} pts
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isMaxLevel 
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 animate-pulse' 
                : 'bg-gradient-to-r from-eco-green to-eco-green-dark'
            }`}
            style={{ width: `${progressInfo.percentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-500 pt-1 pl-1">
          <span>{progress.totalQuestsCompleted} quests completed</span>
          {!isMaxLevel && nextLevel && (
            <span>Next: {nextLevel.icon} {nextLevel.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
