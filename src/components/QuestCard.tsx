'use client';

import Link from 'next/link';
import { Quest } from '@/data/quests';

interface QuestCardProps {
  quest: Quest;
  completed?: boolean;
  distance?: string;
  showStartButton?: boolean;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
  demon: 'bg-purple-100 text-purple-700 border-purple-300'
};

const categoryColors: Record<string, { bg: string; border: string; icon: string }> = {
  'waste-reducer': { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
  'community-helper': { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
  'water-saver': { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
  'bike-rider': { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' },
  'energy-hero': { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' }
};

export default function QuestCard({ quest, completed = false, distance, showStartButton }: QuestCardProps) {
  const colors = categoryColors[quest.category] || categoryColors['waste-reducer'];

  const cardContent = (
    <div 
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${colors.bg} ${colors.border} ${completed ? 'opacity-60' : ''}`}
    >
      {completed && (
        <div className="absolute top-2 right-2 bg-eco-green text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Done
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`text-3xl ${colors.icon} flex-shrink-0`}>
          {quest.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate">
            {quest.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {quest.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyColors[quest.difficulty] || difficultyColors.easy}`}>
              {quest.difficulty === 'demon' ? '👹 Demon' : quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
            </span>
            {distance && (
              <span className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {distance}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {quest.timeEstimate}
            </span>
            <span className="flex items-center gap-1 text-eco-green font-semibold text-xs">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              +{quest.points} pts
            </span>
          </div>
        </div>

        {/* Start button or Arrow */}
        {showStartButton && !completed ? (
          <Link
            href={`/quest/${quest.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 px-4 py-2 bg-eco-green text-white rounded-lg font-semibold text-sm hover:bg-eco-green-dark transition-colors shadow-sm"
          >
            Start
          </Link>
        ) : (
          <div className="flex-shrink-0 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  // If showStartButton is true, don't wrap the whole card in a link
  if (showStartButton) {
    return cardContent;
  }

  return (
    <Link href={`/quest/${quest.id}`}>
      {cardContent}
    </Link>
  );
}
