"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var p_limit_1 = require("p-limit");
var firebase_admin_1 = require("firebase-admin");
var genai_1 = require("@google/genai");
// -------------------- Firebase Admin Init --------------------
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.applicationDefault(),
    });
}
var firestore = firebase_admin_1.default.firestore();
// -------------------- Gemini Init --------------------
var GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment.");
}
var ai = new genai_1.GoogleGenAI({ apiKey: GEMINI_API_KEY });
// -------------------- CONFIG --------------------
var MODEL = "gemini-2.0-flash";
var QUESTS_PER_PLACE = 12;
var MAX_CONCURRENCY_PLACES = 2; // number of places processed in parallel
var MAX_CONCURRENCY_WRITES = 8; // number of parallel Firestore creates
var SLEEP_MS_BETWEEN_GEMINI_CALLS = 450; // small throttle
// Your reward IDs / proof types
var REWARD_IDS = ["Waste Reducer", "Community Helper", "Water Saver", "Bike Rider", "Energy Hero"];
var PROOF_TYPES = ["photo", "checkbox", "note", "gps_or_checkbox", "gps_or_photo", "screenshot"];
// Places (expand this list)
var PLACES = [
    { placeId: "bakke", placeName: "Bakke Recreation & Wellbeing Center", lat: 43.0769, lng: -89.4092 },
    { placeId: "kronshage", placeName: "Kronshage Dorms", lat: 43.0798, lng: -89.4312 },
    { placeId: "memorial_union", placeName: "Memorial Union", lat: 43.0763, lng: -89.4008 },
    { placeId: "picnic_point", placeName: "Picnic Point", lat: 43.0916, lng: -89.4247 },
];
// Collection to write to
var QUESTS_COLLECTION = "quests";
// -------------------- JSON SCHEMA for Gemini --------------------
var questArraySchema = {
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
var sleep = function (ms) { return new Promise(function (r) { return setTimeout(r, ms); }); };
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
    var toRad = function (x) { return (x * Math.PI) / 180; };
    var R = 6371;
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.pow(Math.sin(dLon / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(a));
}
function isRewardId(x) {
    return REWARD_IDS.includes(x);
}
function isProofType(x) {
    return PROOF_TYPES.includes(x);
}
function basicValidateQuest(q, place) {
    if (!q || typeof q !== "object")
        return false;
    if (typeof q.title !== "string" || q.title.trim().length < 4)
        return false;
    if (typeof q.description !== "string" || q.description.trim().length < 10)
        return false;
    if (typeof q.category !== "string" || q.category.trim().length < 3)
        return false;
    if (!isRewardId(q.rewardId))
        return false;
    if (typeof q.time !== "number")
        return false;
    if (q.time < 5 || q.time > 45)
        return false;
    if (typeof q.difficulty !== "number")
        return false;
    if (q.difficulty < 1 || q.difficulty > 4)
        return false;
    if (!q.proof || typeof q.proof !== "object")
        return false;
    if (!isProofType(q.proof.type))
        return false;
    if (typeof q.proof.required !== "boolean")
        return false;
    if (!q.loc || typeof q.loc !== "object")
        return false;
    if (typeof q.loc.latitude !== "number" || typeof q.loc.longitude !== "number")
        return false;
    // Ensure within ~1.5km
    var km = distanceKm(place.lat, place.lng, q.loc.latitude, q.loc.longitude);
    if (km > 1.6)
        return false;
    return true;
}
function normalizeQuest(q, place) {
    var _a, _b, _c, _d, _e, _f, _g;
    // enforce place fields + sanitize numeric fields
    var out = {
        placeId: place.placeId,
        placeName: place.placeName,
        rewardId: q.rewardId,
        time: clamp(Number(q.time), 5, 45),
        title: String((_a = q.title) !== null && _a !== void 0 ? _a : "").trim(),
        description: String((_b = q.description) !== null && _b !== void 0 ? _b : "").trim(),
        category: String((_c = q.category) !== null && _c !== void 0 ? _c : "").trim(),
        difficulty: clamp(Number(q.difficulty), 1, 4),
        proof: {
            type: (_d = q === null || q === void 0 ? void 0 : q.proof) === null || _d === void 0 ? void 0 : _d.type,
            required: Boolean((_e = q === null || q === void 0 ? void 0 : q.proof) === null || _e === void 0 ? void 0 : _e.required),
        },
        loc: {
            latitude: Number((_f = q === null || q === void 0 ? void 0 : q.loc) === null || _f === void 0 ? void 0 : _f.latitude),
            longitude: Number((_g = q === null || q === void 0 ? void 0 : q.loc) === null || _g === void 0 ? void 0 : _g.longitude),
        },
    };
    return out;
}
/**
 * Robustly extract text from the Gemini response without assuming exact SDK shape.
 */
function extractText(res) {
    var _a, _b, _c;
    if (!res)
        return "";
    if (typeof res.text === "string")
        return res.text;
    // Some SDKs nest response in res.response
    var r = (_a = res.response) !== null && _a !== void 0 ? _a : res;
    // Common candidates shape
    var cand = (_b = r === null || r === void 0 ? void 0 : r.candidates) === null || _b === void 0 ? void 0 : _b[0];
    var parts = (_c = cand === null || cand === void 0 ? void 0 : cand.content) === null || _c === void 0 ? void 0 : _c.parts;
    if (Array.isArray(parts)) {
        return parts.map(function (p) { var _a; return (_a = p === null || p === void 0 ? void 0 : p.text) !== null && _a !== void 0 ? _a : ""; }).join("");
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
    return "".concat(q.placeId, "_").concat(slugify(q.title));
}
/**
 * Create-if-not-exists without a read (admin SDK):
 * docRef.create(data) fails if the doc already exists.
 * That gives you the exact behavior of your getDoc+setDoc template,
 * but with fewer reads and fewer bugs under concurrency.
 */
function createQuestIfNotExists(q) {
    return __awaiter(this, void 0, void 0, function () {
        var id, ref, payload, err_1, code, msg;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    id = questDocId(q);
                    ref = firestore.collection(QUESTS_COLLECTION).doc(id);
                    payload = __assign(__assign({ id: id }, q), { seeded: true, createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp() });
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ref.create(payload)];
                case 2:
                    _d.sent();
                    return [2 /*return*/, { created: true, id: id }];
                case 3:
                    err_1 = _d.sent();
                    code = (_b = (_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.code) !== null && _a !== void 0 ? _a : err_1 === null || err_1 === void 0 ? void 0 : err_1.status) !== null && _b !== void 0 ? _b : "";
                    msg = String((_c = err_1 === null || err_1 === void 0 ? void 0 : err_1.message) !== null && _c !== void 0 ? _c : "");
                    if (code === 6 || msg.includes("ALREADY_EXISTS") || msg.includes("already exists")) {
                        return [2 /*return*/, { created: false, id: id }];
                    }
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// -------------------- Gemini generation --------------------
function generateQuestsForPlace(place) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, res, jsonText, data, cleaned, rawQuests, normalized, valid, seen, deduped, _i, valid_1, q, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "\nYou are generating sustainability quests for Madison, WI (UW\u2013Madison campus area).\nGenerate ".concat(QUESTS_PER_PLACE, " quests specifically near: ").concat(place.placeName, " (").concat(place.lat, ", ").concat(place.lng, ").\n\nRules:\n- Each quest must be realistic, safe, and legal.\n- Use categories like: Cleanup, Transit, Energy, Water, Education, Reuse, Community, Nature.\n- Vary difficulty 1-4 (easy..demon mapped as 1..4).\n- loc must be within ~1.5km of the provided coordinates.\n- description must include clear instructions AND explicitly mention the proof type (photo/checkbox/note/etc).\n- rewardId must be one of: ").concat(REWARD_IDS.join(", "), "\n- proof.type must be one of: ").concat(PROOF_TYPES.join(", "), "\n- Make titles unique within this place.\nReturn ONLY JSON matching the schema.\n").trim();
                    return [4 /*yield*/, sleep(SLEEP_MS_BETWEEN_GEMINI_CALLS)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, ai.models.generateContent({
                            model: MODEL,
                            contents: [{ role: "user", parts: [{ text: prompt }] }],
                            generationConfig: {
                                responseMimeType: "application/json",
                                responseJsonSchema: questArraySchema,
                            },
                        })];
                case 2:
                    res = _a.sent();
                    jsonText = extractText(res).trim();
                    if (!jsonText) {
                        throw new Error("Gemini returned empty response for ".concat(place.placeName));
                    }
                    try {
                        data = JSON.parse(jsonText);
                    }
                    catch (e) {
                        cleaned = jsonText
                            .replace(/^```json\s*/i, "")
                            .replace(/^```\s*/i, "")
                            .replace(/```$/i, "")
                            .trim();
                        data = JSON.parse(cleaned);
                    }
                    rawQuests = Array.isArray(data === null || data === void 0 ? void 0 : data.quests) ? data.quests : [];
                    normalized = rawQuests.map(function (q) { return normalizeQuest(q, place); });
                    valid = normalized.filter(function (q) { return basicValidateQuest(q, place); });
                    seen = new Set();
                    deduped = [];
                    for (_i = 0, valid_1 = valid; _i < valid_1.length; _i++) {
                        q = valid_1[_i];
                        key = q.title.toLowerCase();
                        if (!seen.has(key)) {
                            seen.add(key);
                            deduped.push(q);
                        }
                    }
                    if (deduped.length === 0) {
                        throw new Error("No valid quests generated for ".concat(place.placeName, ". Raw count=").concat(rawQuests.length));
                    }
                    return [2 /*return*/, deduped];
            }
        });
    });
}
// -------------------- Write pipeline --------------------
function writeQuests(quests) {
    return __awaiter(this, void 0, void 0, function () {
        var limitWrites, results, created, skipped;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    limitWrites = (0, p_limit_1.default)(MAX_CONCURRENCY_WRITES);
                    return [4 /*yield*/, Promise.all(quests.map(function (q) {
                            return limitWrites(function () { return __awaiter(_this, void 0, void 0, function () {
                                var r;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, createQuestIfNotExists(q)];
                                        case 1:
                                            r = _a.sent();
                                            return [2 /*return*/, r];
                                    }
                                });
                            }); });
                        }))];
                case 1:
                    results = _a.sent();
                    created = results.filter(function (r) { return r.created; }).length;
                    skipped = results.length - created;
                    return [2 /*return*/, { created: created, skipped: skipped, total: results.length }];
            }
        });
    });
}
// -------------------- Main --------------------
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var limitPlaces, tasks;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Seeding ".concat(PLACES.length, " places \u00D7 up to ").concat(QUESTS_PER_PLACE, " quests/place into \"").concat(QUESTS_COLLECTION, "\"..."));
                    limitPlaces = (0, p_limit_1.default)(MAX_CONCURRENCY_PLACES);
                    tasks = PLACES.map(function (place) {
                        return limitPlaces(function () { return __awaiter(_this, void 0, void 0, function () {
                            var quests, stats;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("\n[1/2] Generating quests for: ".concat(place.placeName));
                                        return [4 /*yield*/, generateQuestsForPlace(place)];
                                    case 1:
                                        quests = _a.sent();
                                        console.log("[2/2] Writing ".concat(quests.length, " quests for: ").concat(place.placeName));
                                        return [4 /*yield*/, writeQuests(quests)];
                                    case 2:
                                        stats = _a.sent();
                                        console.log("Done: ".concat(place.placeName, " | created=").concat(stats.created, " skipped(existing)=").concat(stats.skipped, " total=").concat(stats.total));
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                    return [4 /*yield*/, Promise.all(tasks)];
                case 1:
                    _a.sent();
                    console.log("\n✅ All places seeded.");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
});
