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
  lat: number;
  lng: number;
  points: number;
  rewardId: string;
  timeEstimate: string;
};

// sorts all the quests by distance from the user and returns the closest ones, up to the specified limit)
export async function getNearbyQuests(userLat: number, userLng: number, limit = 1): Promise<Quest[]> {
  const snap = await getDocs(collection(db, "quests"));
  const quests = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Quest[];

  return quests
    .map((q) => ({ q, dist: haversineMeters(userLat, userLng, q.lat, q.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((x) => x.q);
}