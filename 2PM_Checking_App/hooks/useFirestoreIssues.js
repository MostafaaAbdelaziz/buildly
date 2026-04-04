import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useMemo } from "react";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

/**
 * Real-time listener for issues belonging to a specific site.
 * Both PM and foreman can read (Firestore rules allow all signed-in users).
 *
 * @param {string|null} siteId
 * @returns {{ issues: object[], loading: boolean, error: Error|null }}
 */
export function useFirestoreIssues(siteId) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!siteId) {
      setIssues([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(firebase_fs, "issues"),
      where("siteId", "==", siteId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setIssues(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        setLoading(false);
      },
      (err) => {
        console.warn("useFirestoreIssues error:", err?.message);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [siteId]);

  return { issues, loading, error };
}

/**
 * Real-time listener for issues across multiple sites.
 * Used by MapScreen so both PM and foreman see all Firestore issues on the map.
 *
 * @param {string[]} siteIds
 * @returns {{ issues: object[], loading: boolean }}
 */
export function useFirestoreIssuesBySites(siteIds) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const stableSiteIds = useMemo(() => siteIds ?? [], [JSON.stringify(siteIds)]);

  useEffect(() => {
    if (!stableSiteIds.length) {
      setIssues([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(firebase_fs, "issues"),
      where("siteId", "in", stableSiteIds),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setIssues(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        setLoading(false);
      },
      (err) => {
        console.warn("useFirestoreIssuesBySites error:", err?.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [stableSiteIds]);

  return { issues, loading };
}

/**
 * Fetch a single issue by ID from Firestore (one-time get).
 *
 * @param {string|null} issueId
 * @returns {{ issue: object|null, loading: boolean }}
 */
export function useFirestoreIssueById(issueId) {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) {
      setIssue(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getDoc(doc(firebase_fs, "issues", issueId))
      .then((snap) => {
        setIssue(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      })
      .catch((e) => console.warn("useFirestoreIssueById error:", e?.message))
      .finally(() => setLoading(false));
  }, [issueId]);

  return { issue, loading };
}
