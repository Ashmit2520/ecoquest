import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// used to determine distance between user and quest in meters
function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

// create a type for quests
export type Quest = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard" | "demon";
  lat: number;
  lng: number;
  points: number;
  badgeCategory: string;
  rewardId: string;
  timeEstimate: string;
  whyItMatters: string;
  icon: string;
};

export type BackendPlaceDoc = {
  id: string;
  placeName?: string;
  placeId?: string;
  center?: { latitude: number; longitude: number };
  raw?: string; 
};

export type RawQuest = {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  difficulty?: number;
  loc?: [number, number];
  rewardId?: string;
};

const BADGE_CATEGORY_MAP: Record<string, string> = {
  "Community Helper": "community-helper",
  community: "community-helper",
  nature: "community-helper",
  "Waste Reducer": "waste-reducer",
  waste: "waste-reducer",
  recycling: "waste-reducer",
  "Water Saver": "water-saver",
  water: "water-saver",
  "Bike Rider": "bike-rider",
  bike: "bike-rider",
  transport: "bike-rider",
  "Energy Hero": "energy-hero",
  energy: "energy-hero",
};

const CATEGORY_ICON_MAP: Record<string, string> = {
  "community-helper": "\u{1F91D}",
  "waste-reducer": "\u267B\uFE0F",
  "water-saver": "\u{1F4A7}",
  "bike-rider": "\u{1F6B4}",
  "energy-hero": "\u26A1",
};

function normalizeBadgeCategory(categoryOrRewardId?: string): string {
  if (!categoryOrRewardId) return "community-helper";
  const trimmed = categoryOrRewardId.trim();
  const direct = BADGE_CATEGORY_MAP[trimmed];
  if (direct) return direct;

  const slug = trimmed.toLowerCase().replace(/[\s_]+/g, "-");
  if (slug in CATEGORY_ICON_MAP) return slug;
  return "community-helper";
}

function normalizeDifficulty(level?: number): "easy" | "medium" | "hard" | "demon" {
  if (level === 1) return "easy";
  if (level === 2) return "medium";
  if (level === 3) return "hard";
  if (level === 4) return "demon";
  return "easy";
}

function difficultyPoints(level: "easy" | "medium" | "hard" | "demon"): number {
  if (level === "medium") return 75;
  if (level === "hard") return 100;
  if (level === "demon") return 140;
  return 50;
}

function difficultyTimeEstimate(level: "easy" | "medium" | "hard" | "demon"): string {
  if (level === "medium") return "15-20 min";
  if (level === "hard") return "20-30 min";
  if (level === "demon") return "30-45 min";
  return "10-15 min";
}

function stripMarkdownJsonFence(raw?: string): string {
  if (!raw) return "[]";
  return raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
}

function parseRawQuest(raw?: string): RawQuest | null {
  const cleaned = stripMarkdownJsonFence(raw);
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return (parsed[0] as RawQuest) ?? null;
    }
    return parsed as RawQuest;
  } catch {
    return null;
  }
}

function toQuest(place: BackendPlaceDoc, parsedRaw: RawQuest | null): Quest {
  const difficulty = normalizeDifficulty(parsedRaw?.difficulty);
  const badgeCategory = normalizeBadgeCategory(parsedRaw?.rewardId ?? parsedRaw?.category);
  const lat = parsedRaw?.loc?.[0] ?? place.center?.latitude ?? 0;
  const lng = parsedRaw?.loc?.[1] ?? place.center?.longitude ?? 0;

  return {
    id: parsedRaw?.id ?? place.id,
    title: parsedRaw?.title ?? `Quest near ${place.placeName ?? "this location"}`,
    description: parsedRaw?.description ?? "Complete an eco-friendly action at this location.",
    category: badgeCategory,
    difficulty,
    lat,
    lng,
    points: difficultyPoints(difficulty),
    badgeCategory,
    rewardId: parsedRaw?.rewardId ?? badgeCategory,
    timeEstimate: difficultyTimeEstimate(difficulty),
    whyItMatters: "Small local actions add up to meaningful environmental impact.",
    icon: CATEGORY_ICON_MAP[badgeCategory] ?? "\u{1F331}",
  };
}

// sorts all the quests by distance from the user and returns the closest ones, up to the specified limit)
export async function getNearbyQuests(userLat: number, userLng: number, limit = 8): Promise<Quest[]> {
  const snap = await getDocs(collection(db, "quests"));
  const placeDocs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as BackendPlaceDoc[];
  const quests = placeDocs.map((doc) => toQuest(doc, parseRawQuest(doc.raw)));

  return quests
    .map((q) => ({ q, dist: haversineMeters(userLat, userLng, q.lat, q.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((x) => x.q);
}

export async function getNearbyQuestsByInput(lat: number, lng: number, limit = 8): Promise<Quest[]> {
  return getNearbyQuests(lat, lng, limit);
}

