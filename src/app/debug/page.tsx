"use client";

import { useEffect, useState } from "react";
import { getNearbyQuests, Quest } from "../../lib/quests/getNearbyQuests";

export default function DebugPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Madison-ish coords (UW campus area)
    getNearbyQuests(43.0766, -89.4041, 8)
      .then(setQuests)
      .catch((e) => setError(e?.message ?? String(e)));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Debug Nearby Quests</h1>
      {error && <pre style={{ color: "red" }}>{error}</pre>}
      <pre>{JSON.stringify(quests, null, 2)}</pre>
    </main>
  );
}