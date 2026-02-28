'use client';

import { useState } from 'react';
import { 
  getLeaderboard, 
  LeaderboardUser, 
  TimeRange, 
  LeaderboardType 
} from '../../data/leaderboard';
import { useAuth } from '../../context/AuthContext';

export default function LeaderboardPage() {
  const { user, lumaCoins } = useAuth();
  const [boardType, setBoardType] = useState<LeaderboardType>('global');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [isFlipping, setIsFlipping] = useState(false);

  const leaderboardData = getLeaderboard(boardType, timeRange);

  const handleBoardTypeChange = (newType: LeaderboardType) => {
    if (newType !== boardType) {
      setIsFlipping(true);
      setTimeout(() => {
        setBoardType(newType);
        setIsFlipping(false);
      }, 300);
    }
  };

  // Find current user's position (simulated)
  const userRank = Math.floor(Math.random() * 50) + 15; // Random rank 15-65
  const userPoints = Math.floor(Math.random() * 2000) + 500;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <span className="text-3xl">🏆</span>
          Leaderboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Compete with eco warriors worldwide</p>
      </div>

      {/* Board Type Flip Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-2xl p-1.5 inline-flex gap-1">
          <button
            onClick={() => handleBoardTypeChange('global')}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              boardType === 'global'
                ? 'bg-white text-eco-green shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => handleBoardTypeChange('local')}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              boardType === 'local'
                ? 'bg-white text-eco-green shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📍 Madison
          </button>
        </div>
      </div>

      {/* Time Range Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {(['week', 'month', 'all'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-eco-green text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-eco-green'
            }`}
          >
            {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Your Position Card */}
      <div className="bg-gradient-to-r from-eco-green to-eco-green-dark rounded-2xl p-4 mb-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            🦊
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/80">Your Position</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">#{userRank}</span>
              <span className="text-sm text-white/70">{boardType === 'global' ? 'Globally' : 'in Madison'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{userPoints}</p>
            <p className="text-xs text-white/70">points</p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div 
        className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
          isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Top 3 Podium */}
        <div className="bg-gradient-to-b from-yellow-50 to-white p-4">
          <div className="flex justify-center items-end gap-2 mb-4">
            {/* 2nd Place */}
            {leaderboardData[1] && (
              <div className="text-center animate-[slide-up_0.5s_ease-out_0.1s_both]">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-3xl mb-2 shadow-lg">
                  {leaderboardData[1].avatar}
                </div>
                <div className="text-sm font-semibold text-gray-900 truncate max-w-[80px]">
                  {leaderboardData[1].username}
                </div>
                <div className="text-xs text-gray-500">{leaderboardData[1].points.toLocaleString()} pts</div>
                <div className="mt-1 bg-gray-300 text-gray-700 rounded-full px-2 py-0.5 text-xs font-bold">
                  🥈 2nd
                </div>
              </div>
            )}

            {/* 1st Place */}
            {leaderboardData[0] && (
              <div className="text-center -mt-4 animate-[slide-up_0.5s_ease-out_both]">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-4xl mb-2 shadow-xl ring-4 ring-yellow-300">
                  {leaderboardData[0].avatar}
                </div>
                <div className="text-sm font-bold text-gray-900 truncate max-w-[90px]">
                  {leaderboardData[0].username}
                </div>
                <div className="text-xs text-gray-500">{leaderboardData[0].points.toLocaleString()} pts</div>
                <div className="mt-1 bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 text-xs font-bold">
                  👑 1st
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboardData[2] && (
              <div className="text-center animate-[slide-up_0.5s_ease-out_0.2s_both]">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-3xl mb-2 shadow-lg">
                  {leaderboardData[2].avatar}
                </div>
                <div className="text-sm font-semibold text-gray-900 truncate max-w-[80px]">
                  {leaderboardData[2].username}
                </div>
                <div className="text-xs text-gray-500">{leaderboardData[2].points.toLocaleString()} pts</div>
                <div className="mt-1 bg-amber-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  🥉 3rd
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rest of Leaderboard */}
        <div className="divide-y divide-gray-100">
          {leaderboardData.slice(3).map((player, index) => (
            <LeaderboardRow 
              key={player.username} 
              player={player} 
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-xl font-bold text-gray-900">
            {boardType === 'global' ? '15,234' : '1,847'}
          </div>
          <div className="text-xs text-gray-500">Active Users</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-xl font-bold text-eco-green">
            {boardType === 'global' ? '89.2k' : '12.4k'}
          </div>
          <div className="text-xs text-gray-500">Quests Done</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-xl font-bold text-amber-500">
            {boardType === 'global' ? '2.1M' : '287k'}
          </div>
          <div className="text-xs text-gray-500">Luma Earned</div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ player, delay }: { player: LeaderboardUser; delay: number }) {
  return (
    <div 
      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
      style={{ animation: `slide-up 0.3s ease-out ${delay}s both` }}
    >
      {/* Rank */}
      <div className="w-8 text-center">
        <span className="text-lg font-bold text-gray-400">#{player.rank}</span>
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
        {player.avatar}
      </div>

      {/* Name & Change */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{player.username}</h3>
        <div className="flex items-center gap-1">
          {player.change === 'up' && (
            <span className="text-green-500 text-xs flex items-center animate-arrow-up">
              ▲ {player.changeAmount}
            </span>
          )}
          {player.change === 'down' && (
            <span className="text-red-500 text-xs flex items-center animate-arrow-down">
              ▼ {player.changeAmount}
            </span>
          )}
          {player.change === 'same' && (
            <span className="text-gray-400 text-xs">— Same</span>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <div className="font-bold text-gray-900">{player.points.toLocaleString()}</div>
        <div className="text-xs text-gray-500">pts</div>
      </div>
    </div>
  );
}
