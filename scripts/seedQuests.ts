/**
 * seedQuests.ts
 * 
 * SETUP
 * 1) npm i firebase-admin @google/genai p-limit dotenv
 * 2) Set env:
 *    - GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccount.json
 *      OR run in an environment with Application Default Credentials.
 * 3) Run:
 *    - npx ts-node seedQuests.ts
 *      (or compile with tsc and run node)
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import "dotenv/config";
import pLimit from "p-limit";
import admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

// -------------------- Firebase Admin Init --------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const firestore = admin.firestore();

// -------------------- Gemini Init --------------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment.");
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// -------------------- CONFIG --------------------
const MODEL = "gemini-2.5-flash";
const QUESTS_PER_PLACE = 12;

const MAX_CONCURRENCY_PLACES = 2;        // number of places processed in parallel
const MAX_CONCURRENCY_WRITES = 8;        // number of parallel Firestore creates
const SLEEP_MS_BETWEEN_GEMINI_CALLS = 450; // small throttle

// Your reward IDs / proof types
const REWARD_IDS = ["Waste Reducer", "Community Helper", "Water Saver", "Bike Rider", "Energy Hero"] as const;
const PROOF_TYPES = ["photo", "checkbox", "note", "gps_or_checkbox", "gps_or_photo", "screenshot"] as const;

// Places (expand this list)
const PLACES = [
  { placeId: "bakke", placeName: "Bakke Recreation & Wellbeing Center", lat: 43.0769, lng: -89.4092 },
  // { placeId: "kronshage", placeName: "Kronshage Dorms", lat: 43.0798, lng: -89.4312 },
  // { placeId: "memorial_union", placeName: "Memorial Union", lat: 43.0763, lng: -89.4008 },
  // { placeId: "picnic_point", placeName: "Picnic Point", lat: 43.0916, lng: -89.4247 },
];

// Collection to write to
const QUESTS_COLLECTION = "quests";

// -------------------- JSON SCHEMA for Gemini --------------------
const questArraySchema = {
  type: "object",
  properties: {
    quests: {
      type: "array",
      minItems: 1,
      maxItems: QUESTS_PER_PLACE,
      items: {
        type: "object",
        properties: {
          placeId: { type: "string" },
          placeName: { type: "string" },

          rewardId: { type: "string", enum: REWARD_IDS },

          time: { type: "integer", minimum: 5, maximum: 45 },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          difficulty: { type: "integer", minimum: 1, maximum: 4 },

          proof: {
            type: "object",
            properties: {
              type: { type: "string", enum: PROOF_TYPES },
              required: { type: "boolean" },
            },
            required: ["type", "required"],
          },

          loc: {
            type: "object",
            properties: {
              latitude: { type: "number" },
              longitude: { type: "number" },
            },
            required: ["latitude", "longitude"],
          },
        },
        required: [
          "placeId",
          "placeName",
          "rewardId",
          "time",
          "title",
          "description",
          "category",
          "difficulty",
          "proof",
          "loc",
        ],
      },
    },
  },
  required: ["quests"],
} as const;

// -------------------- Helpers --------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// Haversine distance in km
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function isRewardId(x: any): x is (typeof REWARD_IDS)[number] {
  return REWARD_IDS.includes(x);
}
function isProofType(x: any): x is (typeof PROOF_TYPES)[number] {
  return PROOF_TYPES.includes(x);
}

function basicValidateQuest(q: any, place: { lat: number; lng: number }): boolean {
  const questLabel = q?.title ? `"${q.title}"` : "(no title)";

  if (!q || typeof q !== "object") {
    console.error(`❌ Invalid quest object: not an object`, q);
    return false;
  }

  if (typeof q.title !== "string" || q.title.trim().length < 4) {
    console.error(`❌ Invalid title for quest ${questLabel}`);
    return false;
  }

  if (typeof q.description !== "string" || q.description.trim().length < 10) {
    console.error(`❌ Invalid description for quest ${questLabel}`);
    return false;
  }

  if (typeof q.category !== "string" || q.category.trim().length < 3) {
    console.error(`❌ Invalid category for quest ${questLabel}`);
    return false;
  }

  if (!isRewardId(q.rewardId)) {
    console.error(`❌ Invalid rewardId for quest ${questLabel}:`, q.rewardId);
    return false;
  }

  if (typeof q.time !== "number") {
    console.error(`❌ Time is not a number for quest ${questLabel}`);
    return false;
  }

  if (q.time < 5 || q.time > 45) {
    console.error(`❌ Time out of range (5–45) for quest ${questLabel}:`, q.time);
    return false;
  }

  if (typeof q.difficulty !== "number") {
    console.error(`❌ Difficulty is not a number for quest ${questLabel}`);
    return false;
  }

  if (q.difficulty < 1 || q.difficulty > 4) {
    console.error(`❌ Difficulty out of range (1–4) for quest ${questLabel}:`, q.difficulty);
    return false;
  }

  if (!q.proof || typeof q.proof !== "object") {
    console.error(`❌ Missing or invalid proof object for quest ${questLabel}`);
    return false;
  }

  if (!isProofType(q.proof.type)) {
    console.error(`❌ Invalid proof.type for quest ${questLabel}:`, q.proof.type);
    return false;
  }

  if (typeof q.proof.required !== "boolean") {
    console.error(`❌ proof.required is not boolean for quest ${questLabel}`);
    return false;
  }

  if (!q.loc || typeof q.loc !== "object") {
    console.error(`❌ Missing or invalid loc object for quest ${questLabel}`);
    return false;
  }

  if (typeof q.loc.latitude !== "number" || typeof q.loc.longitude !== "number") {
    console.error(`❌ Invalid latitude/longitude for quest ${questLabel}`);
    return false;
  }

  const km = distanceKm(place.lat, place.lng, q.loc.latitude, q.loc.longitude);
  if (km > 1.6) {
    console.error(
      `❌ Quest ${questLabel} is too far from place center (${km.toFixed(2)}km)`
    );
    return false;
  }

  return true;
}

function normalizeQuest(q: any, place: { placeId: string; placeName: string; lat: number; lng: number }) {
  // enforce place fields + sanitize numeric fields
  const out = {
    placeId: place.placeId,
    placeName: place.placeName,
    rewardId: q.rewardId,
    time: clamp(Number(q.time), 5, 45),
    title: String(q.title ?? "").trim(),
    description: String(q.description ?? "").trim(),
    category: String(q.category ?? "").trim(),
    difficulty: clamp(Number(q.difficulty), 1, 4),
    proof: {
      type: q?.proof?.type,
      required: Boolean(q?.proof?.required),
    },
    loc: {
      latitude: Number(q?.loc?.latitude),
      longitude: Number(q?.loc?.longitude),
    },
  };
  return out;
}

/**
 * Robustly extract text from the Gemini response without assuming exact SDK shape.
 */
function extractText(res: any): string {
  if (!res) return "";
  if (typeof res.text === "string") return res.text;

  // Some SDKs nest response in res.response
  const r = res.response ?? res;

  // Common candidates shape
  const cand = r?.candidates?.[0];
  const parts = cand?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map((p: any) => p?.text ?? "").join("");
  }

  // Some responses store outputText
  if (typeof r.outputText === "string") return r.outputText;

  return "";
}



/**
 * Deterministic quest doc id (prevents duplicates on re-run).
 */
function questDocId(q: { placeId: string; title: string }) {
  return `${q.placeId}_${slugify(q.title)}`;
}

/**
 * Create-if-not-exists without a read (admin SDK):
 * docRef.create(data) fails if the doc already exists.
 * That gives you the exact behavior of your getDoc+setDoc template,
 * but with fewer reads and fewer bugs under concurrency.
 */
async function createQuestIfNotExists(q: any) {
  const id = questDocId(q);
  const ref = firestore.collection(QUESTS_COLLECTION).doc(id);

  const payload = {
    id,
    ...q,
    seeded: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await ref.create(payload);
    return { created: true, id };
  } catch (err: any) {
    // ALREADY_EXISTS is how Firestore reports doc exists
    const code = err?.code ?? err?.status ?? "";
    const msg = String(err?.message ?? "");
    if (code === 6 || msg.includes("ALREADY_EXISTS") || msg.includes("already exists")) {
      return { created: false, id };
    }
    throw err;
  }
}

// -------------------- Gemini generation --------------------
async function generateQuestsForPlace(place: any) {
  const prompt = `
You are generating sustainability quests for Madison, WI (UW–Madison campus area).
Generate 1 quests specifically near: ${place.placeName} (${place.lat}, ${place.lng}).

Rules:
- Each quest must be realistic, safe, and legal.
- Use categories like: Cleanup, Transit, Energy, Water, Education, Reuse, Community, Nature.
- Vary difficulty 1-4 (easy..demon mapped as 1..4).
- loc must be within ~1.5km of the provided coordinates.
- description must include clear instructions AND explicitly mention the proof type (photo/checkbox/note/etc).
- rewardId must be one of: ${REWARD_IDS.join(", ")}
- proof.type must be one of: ${PROOF_TYPES.join(", ")}
- Make titles unique within this place.
Return ONLY JSON matching the schema.
`.trim();

  await sleep(SLEEP_MS_BETWEEN_GEMINI_CALLS);

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: questArraySchema as any,
    },
  } as any);

  const jsonText = extractText(res).trim();
  // console.log("\n🔵 RAW GEMINI RESPONSE:\n", jsonText, "\n");
  // if (!jsonText) {
  //   throw new Error(`Gemini returned empty response for ${place.placeName}`);
  // }

  // let data: any;
  // try {
  //   data = JSON.parse(jsonText);
  // } catch (e) {
  //   // Sometimes models wrap JSON in code fences—strip if present
  //   const cleaned = jsonText
  //     .replace(/^```json\s*/i, "")
  //     .replace(/^```\s*/i, "")
  //     .replace(/```$/i, "")
  //     .trim();
  //   data = JSON.parse(cleaned);
  // }

  // const rawQuests = Array.isArray(data?.quests) ? data.quests : [];
  // const normalized = rawQuests.map((q: any) => normalizeQuest(q, place));
  // const valid = normalized.filter((q: any) => basicValidateQuest(q, place));

  // // De-dupe titles within a place (just in case)
  // const seen = new Set<string>();
  // const deduped: any[] = [];
  // for (const q of valid) {
  //   const key = q.title.toLowerCase();
  //   if (!seen.has(key)) {
  //     seen.add(key);
  //     deduped.push(q);
  //   }
  // }

  // if (deduped.length === 0) {
  //   throw new Error(`No valid quests generated for ${place.placeName}. Raw count=${rawQuests.length}`);
  // }

  return jsonText;
}

async function saveRawGeminiOutput(place: any, raw: string) {
  const docId = `${place.placeId}_${Date.now()}`;

  await firestore.collection("quests").doc(docId).set({
    placeId: place.placeId,
    placeName: place.placeName,
    center: { latitude: place.lat, longitude: place.lng },
    model: MODEL,
    raw, // <-- entire Gemini string
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ saved raw output: quests/${docId}`);
}

// -------------------- Write pipeline --------------------
async function writeQuests(quests: any[]) {
  const limitWrites = pLimit(MAX_CONCURRENCY_WRITES);
  const results = await Promise.all(
    quests.map((q) =>
      limitWrites(async () => {
        const r = await createQuestIfNotExists(q);
        return r;
      })
    )
  );

  const created = results.filter((r) => r.created).length;
  const skipped = results.length - created;
  return { created, skipped, total: results.length };
}

// -------------------- Main --------------------
async function main() {
  console.log(`Seeding ${PLACES.length} places × up to ${QUESTS_PER_PLACE} quests/place into "${QUESTS_COLLECTION}"...`);
  const limitPlaces = pLimit(MAX_CONCURRENCY_PLACES);

  const tasks = PLACES.map((place) =>
    limitPlaces(async () => {
      console.log(`\n[1/2] Generating quests for: ${place.placeName}`);
      const quests = await generateQuestsForPlace(place);
      console.log(`[2/2] Writing ${quests} quests for: ${place.placeName}`);
      console.log(quests)
      await saveRawGeminiOutput(place, quests);
      // const stats = await writeQuests(quests);
      // console.log(`Done: ${place.placeName} | created=${stats.created} skipped(existing)=${stats.skipped} total=${stats.total}`);
    })
  );

  await Promise.all(tasks);
  console.log("\n✅ All places seeded.");
}

main().catch((e) => {
  console.error("\n❌ Seed failed:", e);
  process.exit(1);
});