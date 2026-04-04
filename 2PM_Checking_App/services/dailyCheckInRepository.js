import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

/** @typedef {"on_track" | "not_on_track"} CheckInStatus */

/**
 * Local calendar date YYYY-MM-DD (device timezone).
 * @param {Date} [d]
 */
export function getLocalDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Deterministic Firestore doc id: siteId + localDate + userId (must match rules).
 * @param {string} siteId
 * @param {string} localDate YYYY-MM-DD
 * @param {string} userId
 */
export function makeDailyCheckInDocId(siteId, localDate, userId) {
  return `${siteId}_${localDate}_${userId}`;
}

/**
 * Expected check-in roster: project manager + all ACTIVE site_members (deduped).
 * @param {{ projectManagerId?: string } | null} site
 * @param {Array<{ userId?: string, status?: string }>} members
 * @returns {string[]}
 */
export function buildExpectedCheckInUserIds(site, members) {
  const ids = new Set();
  if (site?.projectManagerId) {
    ids.add(site.projectManagerId);
  }
  for (const m of members || []) {
    if (m.status === "ACTIVE" && m.userId) {
      ids.add(m.userId);
    }
  }
  return [...ids];
}

/**
 * @param {{ projectManagerId?: string } | null} site
 * @param {Array<{ userId?: string, status?: string }>} members
 * @param {string | undefined} userId
 */
export function userCanCheckInForSite(site, members, userId) {
  if (!site || !userId) return false;
  if (site.projectManagerId === userId) return true;
  return (members || []).some((m) => m.status === "ACTIVE" && m.userId === userId);
}

/**
 * @param {string} siteId
 * @param {CheckInStatus} status
 * @param {string} userId
 * @param {string} projectManagerId - denormalized from sites/{siteId} so PM can query without get()-based rules
 * @param {string} [localDate] defaults to today local
 */
export async function submitDailyCheckIn(
  siteId,
  status,
  userId,
  projectManagerId,
  localDate = getLocalDateString()
) {
  const id = makeDailyCheckInDocId(siteId, localDate, userId);
  const ref = doc(firebase_fs, "daily_check_ins", id);
  await setDoc(
    ref,
    {
      siteId,
      userId,
      projectManagerId,
      localDate,
      status,
      submittedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * @param {string} siteId
 * @param {string} userId
 * @param {string} [localDate]
 */
export async function getDailyCheckInForUser(siteId, userId, localDate = getLocalDateString()) {
  const id = makeDailyCheckInDocId(siteId, localDate, userId);
  const ref = doc(firebase_fs, "daily_check_ins", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Subscribe to all check-ins for a site on a given local calendar day (PM view).
 * Must filter by projectManagerId so Firestore security rules can authorize the query
 * (rules are not filters — the query must constrain the same fields as the read rule).
 * @param {string} siteId
 * @param {string} localDate YYYY-MM-DD
 * @param {string} projectManagerId - same as sites/{siteId}.projectManagerId (caller's uid when PM)
 * @param {(rows: Array<{ id: string } & Record<string, unknown>>) => void} onNext
 * @param {(e: Error) => void} [onError]
 * @returns {() => void}
 */
export function subscribeDailyCheckInsForSiteDate(
  siteId,
  localDate,
  projectManagerId,
  onNext,
  onError
) {
  const q = query(
    collection(firebase_fs, "daily_check_ins"),
    where("siteId", "==", siteId),
    where("localDate", "==", localDate),
    where("projectManagerId", "==", projectManagerId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onNext(rows);
    },
    (err) => {
      if (onError) onError(err);
      else console.warn("subscribeDailyCheckInsForSiteDate", err?.message);
    }
  );
}
