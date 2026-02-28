'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuestById, Quest, BadgeCategory } from '@/data/quests';
import { getBadgeById, getCurrentLevel, UserBadgeProgress, initialBadgeProgress, Badge } from '@/data/badges';
import CompletionModal from '@/components/CompletionModal';
import SuccessModal from '@/components/SuccessModal';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';

const categoryLabels: Record<BadgeCategory, string> = {
  'waste-reducer': 'Waste Reduction',
  'community-helper': 'Community Service',
  'water-saver': 'Water Conservation',
  'bike-rider': 'Eco Transportation',
  'energy-hero': 'Energy Conservation'
};

const categoryColors: Record<BadgeCategory, { bg: string; text: string; border: string }> = {
  'waste-reducer': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'community-helper': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'water-saver': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'bike-rider': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'energy-hero': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' }
};

export default function QuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addLumaCoins } = useAuth();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);
  const [newLevel, setNewLevel] = useState(1);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [isNewBadge, setIsNewBadge] = useState(false);
  const [earnedLumaCoins, setEarnedLumaCoins] = useState(0);

  useEffect(() => {
    const questId = params.id as string;
    const foundQuest = getQuestById(questId);
    setQuest(foundQuest || null);

    // Check if already completed
    const completedQuests = JSON.parse(localStorage.getItem('ecoquest_completed') || '[]');
    setIsCompleted(completedQuests.includes(questId));
  }, [params.id]);

  const triggerConfetti = useCallback(() => {
    // Fire confetti from multiple angles
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#22c55e', '#16a34a', '#4ade80']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#fbbf24', '#f59e0b', '#eab308']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#0ea5e9', '#06b6d4', '#22d3ee']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#a855f7', '#8b5cf6', '#c084fc']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#22c55e', '#fbbf24', '#0ea5e9']
    });
  }, []);

  const handleComplete = useCallback((note: string, hasPhoto: boolean) => {
    if (!quest) return;

    // Get current badge progress
    let badgeProgress: UserBadgeProgress[] = JSON.parse(
      localStorage.getItem('ecoquest_badge_progress') || JSON.stringify(initialBadgeProgress)
    );

    // Find the badge for this quest
    const badge = getBadgeById(quest.badgeCategory);
    if (!badge) return;

    // Find current progress for this badge
    const progressIndex = badgeProgress.findIndex(p => p.badgeId === quest.badgeCategory);
    const currentProgress = badgeProgress[progressIndex];
    
    // Calculate old and new levels
    const oldLevel = getCurrentLevel(badge, currentProgress.currentPoints);
    const newPoints = currentProgress.currentPoints + quest.points;
    const newLevelInfo = getCurrentLevel(badge, newPoints);

    // Check if this is a level up
    const didLevelUp = newLevelInfo.level > oldLevel.level;
    const isFirstQuest = currentProgress.totalQuestsCompleted === 0;

    // Update progress
    badgeProgress[progressIndex] = {
      ...currentProgress,
      currentPoints: newPoints,
      currentLevel: newLevelInfo.level,
      totalQuestsCompleted: currentProgress.totalQuestsCompleted + 1
    };

    // Save to localStorage
    localStorage.setItem('ecoquest_badge_progress', JSON.stringify(badgeProgress));

    // Mark quest as completed
    const completedQuests = JSON.parse(localStorage.getItem('ecoquest_completed') || '[]');
    completedQuests.push(quest.id);
    localStorage.setItem('ecoquest_completed', JSON.stringify(completedQuests));

    // Track completion date for calendar
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const completionHistory = JSON.parse(localStorage.getItem('ecoquest_completion_history') || '[]');
    if (!completionHistory.includes(dateStr)) {
      completionHistory.push(dateStr);
      localStorage.setItem('ecoquest_completion_history', JSON.stringify(completionHistory));
    }

    // Update total points
    const totalPoints = parseInt(localStorage.getItem('ecoquest_total_points') || '0');
    localStorage.setItem('ecoquest_total_points', String(totalPoints + quest.points));

    // Calculate Luma coins based on difficulty
    const difficultyMultiplier = {
      'easy': 10,
      'medium': 25,
      'hard': 50,
      'demon': 100
    };
    const baseCoins = difficultyMultiplier[quest.difficulty] || 10;
    const bonusCoins = didLevelUp ? 50 : 0;
    const photoBonus = hasPhoto ? 5 : 0;
    const totalCoins = baseCoins + bonusCoins + photoBonus;
    
    // Award Luma coins
    addLumaCoins(totalCoins);
    setEarnedLumaCoins(totalCoins);

    // Close completion modal
    setShowCompletionModal(false);
    setIsCompleted(true);

    // Trigger confetti
    triggerConfetti();

    // Show success modal
    setEarnedBadge(badge);
    setNewLevel(newLevelInfo.level);
    setIsLevelUp(didLevelUp);
    setIsNewBadge(isFirstQuest);
    
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 500);
  }, [quest, triggerConfetti, addLumaCoins]);

  const openGoogleMaps = () => {
    if (!quest) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${quest.lat},${quest.lng}`;
    window.open(url, '_blank');
  };

  if (!quest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quest Not Found</h1>
        <p className="text-gray-600 mb-6">This quest doesn&apos;t exist or has been removed.</p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-eco-green text-white rounded-xl font-semibold hover:bg-eco-green-dark transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Map
        </Link>
      </div>
    );
  }

  const colors = categoryColors[quest.category];
  const badge = getBadgeById(quest.badgeCategory);

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Map
        </Link>

        {/* Quest Header */}
        <div className={`relative p-6 rounded-2xl ${colors.bg} border-2 ${colors.border} mb-6`}>
          {isCompleted && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-eco-green text-white rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completed
            </div>
          )}

          <div className="text-5xl mb-4">{quest.icon}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quest.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
              {categoryLabels[quest.category]}
            </span>
            <span className="flex items-center gap-1 text-gray-600 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {quest.timeEstimate}
            </span>
            <span className="flex items-center gap-1 text-eco-green font-semibold text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              +{quest.points} points
            </span>
          </div>

          <p className="text-gray-700">{quest.description}</p>
        </div>

        {/* Why It Matters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Why It Matters
          </h2>
          <p className="text-gray-600 leading-relaxed">{quest.whyItMatters}</p>
        </div>

        {/* Badge Info */}
        {badge && (
          <div className={`${badge.bgColor} rounded-2xl border-2 ${badge.borderColor} p-4 mb-6`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{badge.icon}</div>
              <div>
                <p className="text-sm text-gray-600">Completing this quest earns progress toward:</p>
                <p className={`font-semibold ${badge.color}`}>{badge.name} Badge</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-eco-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location
          </h2>
          <div className="bg-gray-100 rounded-xl p-4 mb-4">
            <p className="text-gray-600 text-sm">Madison, WI Area</p>
            <p className="text-gray-500 text-xs mt-1">Coordinates: {quest.lat.toFixed(4)}, {quest.lng.toFixed(4)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={openGoogleMaps}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Navigate
          </button>
          
          <button
            onClick={() => setShowCompletionModal(true)}
            disabled={isCompleted}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              isCompleted
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-eco-green text-white hover:bg-eco-green-dark shadow-lg shadow-eco-green/30'
            }`}
          >
            {isCompleted ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Completed
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Complete Quest
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <CompletionModal
        quest={quest}
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={handleComplete}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        badge={earnedBadge}
        newLevel={newLevel}
        pointsGained={quest.points}
        lumaCoinsEarned={earnedLumaCoins}
        isLevelUp={isLevelUp}
        isNewBadge={isNewBadge}
      />
    </>
  );
}
