'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/data/badges';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: Badge | null;
  newLevel: number;
  pointsGained: number;
  lumaCoinsEarned?: number;
  isNewBadge?: boolean;
  isLevelUp?: boolean;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  badge, 
  newLevel, 
  pointsGained,
  lumaCoinsEarned = 0,
  isNewBadge = false,
  isLevelUp = false
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !badge) return null;

  const levelInfo = badge.levels.find(l => l.level === newLevel) || badge.levels[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white pointer-events-none" />
        
        {/* Sparkle effects */}
        <div className="absolute top-4 left-4 text-2xl animate-bounce">✨</div>
        <div className="absolute top-8 right-8 text-xl animate-bounce delay-100">⭐</div>
        <div className="absolute bottom-12 left-8 text-lg animate-bounce delay-200">✨</div>
        <div className="absolute bottom-16 right-4 text-2xl animate-bounce delay-300">🎉</div>

        {/* Content */}
        <div className="relative">
          {/* Success title */}
          <h2 className="text-3xl font-bold text-eco-green mb-2">
            {isNewBadge ? '🎊 New Badge!' : isLevelUp ? '🏆 Level Up!' : '✅ Success!'}
          </h2>
          <p className="text-gray-600 mb-6">
            Quest completed successfully!
          </p>

          {/* Badge display */}
          <div className={`inline-flex flex-col items-center p-6 rounded-2xl ${badge.bgColor} border-2 ${badge.borderColor} mb-6 ${isNewBadge || isLevelUp ? 'animate-badge-unlock' : ''}`}>
            <div className="text-6xl mb-2">
              {levelInfo.icon}
            </div>
            <h3 className={`text-xl font-bold ${badge.color}`}>
              {badge.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {levelInfo.name}
            </p>
            <div className="flex items-center gap-1 mt-2 px-3 py-1 bg-white rounded-full shadow-sm">
              <span className="text-sm font-semibold text-gray-700">Level {newLevel}</span>
            </div>
          </div>

          {/* Points and Luma coins gained */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-1 px-4 py-2 bg-eco-green/10 rounded-full">
              <svg className="w-5 h-5 text-eco-green" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-eco-green">+{pointsGained} pts</span>
            </div>
            {lumaCoinsEarned > 0 && (
              <div className="flex items-center gap-1 px-4 py-2 bg-amber-100 rounded-full animate-[coin-bounce_1s_ease-in-out_infinite]">
                <Image src="/erasebg-transformed%20(2).png" alt="Luma Coin" width={24} height={24} />
                <span className="font-bold text-amber-600">+{lumaCoinsEarned} Luma</span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-eco-green hover:bg-eco-green-dark shadow-lg shadow-eco-green/30 transition-all"
          >
            Awesome! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
