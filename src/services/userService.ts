import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export async function createUserIfNotExists(user: any) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      weeklyPoints: 0,
      createdAt: new Date(),
      level: 0,
      weekId: 0,
      xp: 0,
      collectibles: [],
    });
  }
}

export async function updateUserPoints(uid: string, points: number) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    weeklyPoints: increment(points),
  });
}