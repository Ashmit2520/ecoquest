'use client';

import { useState, useEffect, useMemo } from 'react';
import { quests, Quest } from '../data/quests';
import QuestCard from '../components/QuestCard';
import Link from 'next/link';
import { signInWithGoogle } from "../services/authService";
import { getLeaderboard } from "../services/leaderboardService";



async function testLeaderboard() {
  const data = await getLeaderboard();
  console.log(data);
}


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

  <><button onClick={signInWithGoogle}>
      Sign in with Google
    </button><button onClick={testLeaderboard}>
        Test Leaderboard
      </button></>

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



async function testLeaderboard() {
  const data = await getLeaderboard();
  console.log(data);
}
}