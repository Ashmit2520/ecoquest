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
const MAX_CONCURRENCY_PLACES = 2; // number of places processed in parallel
const MAX_CONCURRENCY_WRITES = 8; // number of parallel Firestore creates
const SLEEP_MS_BETWEEN_GEMINI_CALLS = 450; // small throttle
// Your reward IDs / proof types
const REWARD_IDS = ["Waste Reducer", "Community Helper", "Water Saver", "Bike Rider", "Energy Hero"];
const PROOF_TYPES = ["photo", "checkbox", "note", "gps_or_checkbox", "gps_or_photo", "screenshot"];
// Places (expand this list)
const PLACES = [
    { placeId: "bakke", placeName: "Bakke Recreation & Wellbeing Center", lat: 43.0769, lng: -89.4092 },
    { placeId: "kronshage", placeName: "Kronshage Dorms", lat: 43.0798, lng: -89.4312 },
    { placeId: "memorial_union", placeName: "Memorial Union", lat: 43.0763, lng: -89.4008 },
    { placeId: "picnic_point", placeName: "Picnic Point", lat: 43.0916, lng: -89.4247 },
    { placeId: "union_south", placeName: "Union South", lat: 43.0713, lng: -89.4085 },
    { placeId: "grainger_library", placeName: "Wendt Commons (formerly Grainger Engineering Library)", lat: 43.0735, lng: -89.4073 },
    { placeId: "college_library", placeName: "College Library", lat: 43.0756, lng: -89.3995 },
    { placeId: "steenbock_library", placeName: "Steenbock Library", lat: 43.0754, lng: -89.4057 },
    { placeId: "chazen_museum", placeName: "Chazen Museum of Art", lat: 43.0739, lng: -89.4012 },
    { placeId: "bascom_hall", placeName: "Bascom Hall", lat: 43.0754, lng: -89.4041 },
    { placeId: "van_vleck", placeName: "Van Vleck Hall", lat: 43.0742, lng: -89.4035 },
    { placeId: "humanities", placeName: "Humanities Building", lat: 43.0759, lng: -89.4025 },
    { placeId: "educational_sciences", placeName: "Educational Sciences Building", lat: 43.0748, lng: -89.4010 },
    { placeId: "chemistry_building", placeName: "Chemistry Building", lat: 43.0745, lng: -89.4048 },
    { placeId: "engineering_hall", placeName: "Engineering Hall", lat: 43.0725, lng: -89.4081 },
    { placeId: "mech_eng", placeName: "Mechanical Engineering Building", lat: 43.0720, lng: -89.4072 },
    { placeId: "computer_sciences", placeName: "Computer Sciences Building", lat: 43.0726, lng: -89.4069 },
    { placeId: "discovery_building", placeName: "Wisconsin Institutes for Discovery", lat: 43.0718, lng: -89.4078 },
    { placeId: "microbial_sciences", placeName: "Microbial Sciences Building", lat: 43.0730, lng: -89.4059 },
    { placeId: "biotechnology_center", placeName: "Biotechnology Center", lat: 43.0727, lng: -89.4052 },
    { placeId: "ag_hall", placeName: "Agricultural Hall", lat: 43.0757, lng: -89.4049 },
    { placeId: "animal_sciences", placeName: "Animal Sciences Building", lat: 43.0759, lng: -89.4062 },
    { placeId: "dejope", placeName: "Dejope Residence Hall", lat: 43.0770, lng: -89.4045 },
    { placeId: "oglebay", placeName: "Ogg Residence Hall", lat: 43.0709, lng: -89.4097 },
    { placeId: "smith_hall", placeName: "Smith Residence Hall", lat: 43.0704, lng: -89.4086 },
    { placeId: "sellery", placeName: "Sellery Residence Hall", lat: 43.0714, lng: -89.4047 },
    { placeId: "witte", placeName: "Witte Residence Hall", lat: 43.0717, lng: -89.4051 },
    { placeId: "bradley", placeName: "Bradley Residence Hall", lat: 43.0779, lng: -89.4307 },
    { placeId: "cole", placeName: "Cole Residence Hall", lat: 43.0782, lng: -89.4301 },
    { placeId: "carson_gulley", placeName: "Carson Gulley Center", lat: 43.0774, lng: -89.4049 },
    { placeId: "four_lakes_market", placeName: "Four Lakes Market", lat: 43.0770, lng: -89.4045 },
    { placeId: "camp_randall", placeName: "Camp Randall Stadium", lat: 43.0699, lng: -89.4127 },
    { placeId: "kohl_center", placeName: "Kohl Center", lat: 43.0698, lng: -89.3965 },
    { placeId: "natatorium", placeName: "Natatorium", lat: 43.0758, lng: -89.4094 },
    { placeId: "nicholas_rec", placeName: "Nicholas Recreation Center", lat: 43.0694, lng: -89.4114 },
    { placeId: "lathrop_hall", placeName: "Lathrop Hall", lat: 43.0750, lng: -89.4019 },
    { placeId: "music_hall", placeName: "Music Hall", lat: 43.0767, lng: -89.4010 },
    { placeId: "law_school", placeName: "UW Law School", lat: 43.0747, lng: -89.4030 },
    { placeId: "medical_sciences", placeName: "Medical Sciences Center", lat: 43.0778, lng: -89.4323 },
    { placeId: "uw_hospital", placeName: "UW Hospital", lat: 43.0776, lng: -89.4319 },
    { placeId: "arboretum", placeName: "UW Arboretum Visitor Center", lat: 43.0426, lng: -89.4297 },
    { placeId: "eagle_heights", placeName: "Eagle Heights Community Gardens", lat: 43.0806, lng: -89.4180 },
    { placeId: "allen_centennial", placeName: "Allen Centennial Garden", lat: 43.0748, lng: -89.4059 },
    { placeId: "washington_ave", placeName: "East Campus Mall", lat: 43.0751, lng: -89.4003 },
    { placeId: "state_street", placeName: "State Street (Campus End)", lat: 43.0756, lng: -89.3990 },
    { placeId: "mifflin", placeName: "Mifflin Street Area", lat: 43.0738, lng: -89.4020 },
    { placeId: "nancy_nicholas", placeName: "Nancy Nicholas Hall", lat: 43.0715, lng: -89.4101 },
    { placeId: "science_hall", placeName: "Science Hall", lat: 43.0762, lng: -89.4040 },
    { placeId: "social_sciences", placeName: "Social Sciences Building", lat: 43.0733, lng: -89.4015 },
    { placeId: "institute_for_research", placeName: "Institute for Research on Poverty", lat: 43.0741, lng: -89.4028 },
    { placeId: "fluno_center", placeName: "Fluno Center", lat: 43.0737, lng: -89.4009 },
    { placeId: "red_gym", placeName: "Red Gym", lat: 43.0759, lng: -89.4015 },
    { placeId: "memorial_library", placeName: "Memorial Library", lat: 43.0768, lng: -89.4012 }
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
};
// -------------------- Helpers --------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function slugify(s) {
    return s
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}
function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
}
// Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}
function isRewardId(x) {
    return REWARD_IDS.includes(x);
}
function isProofType(x) {
    return PROOF_TYPES.includes(x);
}
function basicValidateQuest(q, place) {
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
        console.error(`❌ Quest ${questLabel} is too far from place center (${km.toFixed(2)}km)`);
        return false;
    }
    return true;
}
function normalizeQuest(q, place) {
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
function extractText(res) {
    if (!res)
        return "";
    if (typeof res.text === "string")
        return res.text;
    // Some SDKs nest response in res.response
    const r = res.response ?? res;
    // Common candidates shape
    const cand = r?.candidates?.[0];
    const parts = cand?.content?.parts;
    if (Array.isArray(parts)) {
        return parts.map((p) => p?.text ?? "").join("");
    }
    // Some responses store outputText
    if (typeof r.outputText === "string")
        return r.outputText;
    return "";
}
/**
 * Deterministic quest doc id (prevents duplicates on re-run).
 */
function questDocId(q) {
    return `${q.placeId}_${slugify(q.title)}`;
}
/**
 * Create-if-not-exists without a read (admin SDK):
 * docRef.create(data) fails if the doc already exists.
 * That gives you the exact behavior of your getDoc+setDoc template,
 * but with fewer reads and fewer bugs under concurrency.
 */
async function createQuestIfNotExists(q) {
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
    }
    catch (err) {
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
async function generateQuestsForPlace(place) {
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
            responseJsonSchema: questArraySchema,
        },
    });
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
async function saveRawGeminiOutput(place, raw) {
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
async function writeQuests(quests) {
    const limitWrites = pLimit(MAX_CONCURRENCY_WRITES);
    const results = await Promise.all(quests.map((q) => limitWrites(async () => {
        const r = await createQuestIfNotExists(q);
        return r;
    })));
    const created = results.filter((r) => r.created).length;
    const skipped = results.length - created;
    return { created, skipped, total: results.length };
}
async function main() {
    console.log(`Seeding ${PLACES.length} places × up to ${QUESTS_PER_PLACE} quests/place into "${QUESTS_COLLECTION}"...`);
    const limitPlaces = pLimit(MAX_CONCURRENCY_PLACES);
    for (let round = 1; round <= 5; round++) {
        console.log(`\n============================`);
        console.log(`🚀 ROUND ${round} STARTING`);
        console.log(`============================`);
        const tasks = PLACES.map((place) => limitPlaces(async () => {
            console.log(`\n[1/2] Generating quests for: ${place.placeName}`);
            const quests = await generateQuestsForPlace(place);
            console.log(`[2/2] Writing quests for: ${place.placeName}`);
            console.log(quests);
            await saveRawGeminiOutput(place, quests);
        }));
        await Promise.all(tasks);
        console.log(`\n✅ ROUND ${round} COMPLETE\n`);
    }
}
// // ✅ THIS MUST BE OUTSIDE main()
// main().catch((e) => {
//     console.error("\n❌ Seed failed:", e);
//     process.exit(1);
// });
