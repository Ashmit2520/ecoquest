"use client";

import { signInWithGoogle } from "../services/authService";
import { getLeaderboard } from "../services/leaderboardService";

async function testLeaderboard() {
  const data = await getLeaderboard();
  console.log(data);
}


export default function Home() {
  return (
    <><button onClick={signInWithGoogle}>
      Sign in with Google
    </button><button onClick={testLeaderboard}>
        Test Leaderboard
      </button></>
  );
}