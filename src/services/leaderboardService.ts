import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, updateDoc, increment } from "firebase/firestore";

export async function updateUserPoints(uid: string, points: number) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    weeklyPoints: increment(points),
  });
}


export async function createUserIfNotExists(user: any) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      weeklyPoints: 0,
    });
  }
}

export async function getLeaderboard() {
  const q = query(
    collection(db, "users"),
    orderBy("weeklyPoints", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data());
}