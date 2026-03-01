import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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