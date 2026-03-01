'use client';

import { useState, useEffect, useMemo } from 'react';
import { quests, Quest } from '../data/quests';
import QuestCard from '../components/QuestCard';
import Link from 'next/link';

// Mock user location (Madison, WI - near Capitol Square)
const USER_LOCATION = { lat: 43.0731, lng: -89.4012 };
const MOCK_ACTIVE_MEMBERS = 247;

type SortOption = 'nearest' | 'easiest' | 'points' | 'time';
type Difficulty = 'easy' | 'medium' | 'hard' | 'demon';

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getDistanceLabel(miles: number): string {
  if (miles < 0.1) return 'Right here';
  if (miles < 1) return `${Math.round(miles * 5280)} ft`;
  return `${miles.toFixed(1)} mi`;
}

function parseTimeEstimate(timeStr: string): number {
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 15;
}

const difficultyOrder: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  demon: 4
};

export default function HomePage() {
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('nearest');
  const [difficultyFilters, setDifficultyFilters] = useState<Difficulty[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ecoquest_completed');
    if (saved) {
      setCompletedQuests(JSON.parse(saved));
    }
  }, []);

  // Calculate distances for all quests
  const questsWithDistance = useMemo(() => {
    return quests.map(quest => ({
      ...quest,
      distance: calculateDistance(USER_LOCATION.lat, USER_LOCATION.lng, quest.lat, quest.lng)
    }));
  }, []);

  // Filter and sort quests
  const filteredQuests = useMemo(() => {
    let filtered = questsWithDistance.filter(q => !completedQuests.includes(q.id));
    
    // Apply difficulty filter
    if (difficultyFilters.length > 0) {
      filtered = filtered.filter(q => difficultyFilters.includes(q.difficulty as Difficulty));
    }

    // Sort
    switch (sortBy) {
      case 'nearest':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'easiest':
        filtered.sort((a, b) => difficultyOrder[a.difficulty as Difficulty] - difficultyOrder[b.difficulty as Difficulty]);
        break;
      case 'points':
        filtered.sort((a, b) => b.points - a.points);
        break;
      case 'time':
        filtered.sort((a, b) => parseTimeEstimate(a.timeEstimate) - parseTimeEstimate(b.timeEstimate));
        break;
    }

    return filtered;
  }, [questsWithDistance, completedQuests, sortBy, difficultyFilters]);

  const completedQuestsList = questsWithDistance.filter(q => completedQuests.includes(q.id));
  const selectedQuest = questsWithDistance.find(q => q.id === selectedQuestId);

  const toggleDifficultyFilter = (diff: Difficulty) => {
    setDifficultyFilters(prev => 
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map Panel - Left Side */}
        <div className="lg:col-span-3">
          <div className="sticky top-32">
            {/* Map Container */}
            <div className="relative bg-gradient-to-br from-green-100 via-blue-50 to-green-50 rounded-2xl border-2 border-green-200 overflow-hidden shadow-lg" style={{ height: '520px' }}>
              {/* Grid background */}
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Quest markers */}
              <div className="absolute inset-0 p-6">
                {questsWithDistance.map((quest, index) => {
                  const isSelected = quest.id === selectedQuestId;
                  const isCompleted = completedQuests.includes(quest.id);
                  
                  return (
                    <button
                      key={quest.id}
                      onClick={() => setSelectedQuestId(isSelected ? null : quest.id)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        isCompleted ? 'opacity-40' : ''
                      } ${isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}
                      style={{
                        left: `${12 + (index % 4) * 24}%`,
                        top: `${15 + Math.floor(index / 4) * 35}%`,
                      }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isCompleted 
                          ? 'bg-gray-200 border-2 border-gray-300' 
                          : isSelected
                            ? 'bg-eco-green border-3 border-white ring-4 ring-eco-green/30'
                            : 'bg-white border-2 border-eco-green hover:border-eco-green-dark'
                      }`}>
                        <span className="text-xl">{quest.icon}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-eco-green" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* User location marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="relative">
                  <div className="w-5 h-5 bg-blue-500 rounded-full border-3 border-white shadow-lg" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500/20 rounded-full animate-ping" />
                </div>
              </div>

              {/* Selected Quest Preview */}
              {selectedQuest && (
                <div className="absolute top-4 left-4 right-4 z-40">
                  <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-100 animate-slide-down">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{selectedQuest.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900">{selectedQuest.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                          <span className="text-gray-500">{getDistanceLabel(selectedQuest.distance)}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{selectedQuest.timeEstimate}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-eco-green font-semibold">+{selectedQuest.points} pts</span>
                        </div>
                      </div>
                      <Link 
                        href={`/quest/${selectedQuest.id}`}
                        className="px-4 py-2 bg-eco-green text-white rounded-lg font-semibold text-sm hover:bg-eco-green-dark transition-colors"
                      >
                        Start
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom info panel */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-eco-green/10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-eco-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Madison, WI</p>
                      <p className="text-sm text-gray-500">{filteredQuests.length} quests visible</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-700 font-medium">{MOCK_ACTIVE_MEMBERS} active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quest List - Right Side */}
        <div className="lg:col-span-2">
          {/* Filter & Sort Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            {/* Sort */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Sort by</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'nearest', label: 'Nearest' },
                  { value: 'easiest', label: 'Easiest' },
                  { value: 'points', label: 'Most Points' },
                  { value: 'time', label: 'Shortest' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as SortOption)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sortBy === option.value
                        ? 'bg-eco-green text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-300' },
                  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700 border-red-300' },
                  { value: 'demon', label: '👹 Demon', color: 'bg-purple-100 text-purple-700 border-purple-300' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleDifficultyFilter(option.value as Difficulty)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      difficultyFilters.includes(option.value as Difficulty)
                        ? option.color
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Quests */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-eco-green rounded-full animate-pulse" />
              Nearby Quests
              <span className="text-sm font-normal text-gray-500">({filteredQuests.length})</span>
            </h2>
            
            {filteredQuests.length > 0 ? (
              <div className="space-y-3">
                {filteredQuests.map((quest) => (
                  <div 
                    key={quest.id}
                    onClick={() => setSelectedQuestId(quest.id === selectedQuestId ? null : quest.id)}
                    className={`transition-all duration-200 cursor-pointer ${
                      quest.id === selectedQuestId ? 'ring-2 ring-eco-green ring-offset-2 rounded-xl' : ''
                    }`}
                  >
                    <QuestCard 
                      quest={quest} 
                      completed={false}
                      distance={getDistanceLabel(quest.distance)}
                      showStartButton
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-600">No quests match your filters</p>
                <button 
                  onClick={() => setDifficultyFilters([])}
                  className="mt-2 text-eco-green font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Completed Quests */}
          {completedQuestsList.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-eco-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Completed
                <span className="text-sm font-normal text-gray-500">({completedQuestsList.length})</span>
              </h2>
              <div className="space-y-3">
                {completedQuestsList.map((quest) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    completed={true}
                    distance={getDistanceLabel(quest.distance)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
