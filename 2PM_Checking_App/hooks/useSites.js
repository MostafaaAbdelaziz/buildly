import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  documentId,
} from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

export function useSites(userId) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setSites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const q = query(
      collection(firebase_fs, "sites"),
      where("projectManagerId", "==", userId)
    );
    const unsub = onSnapshot(
      q,
      async (snap) => {
        try {
          const managerSites = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((site) => site.deleted !== true);

          if (managerSites.length > 0) {
            const sortedManagerSites = managerSites.sort((a, b) => {
              const ta = a.createdAt?.seconds ?? 0;
              const tb = b.createdAt?.seconds ?? 0;
              return tb - ta;
            });

            setSites(sortedManagerSites);
            setLoading(false);
            return;
          }
          const memberQ = query(
            collection(firebase_fs, "site_members"),
            where("userId", "==", userId),
            where("status", "==", "ACTIVE")
          );

          const memberSnap = await getDocs(memberQ);
          const siteIds = [...new Set(memberSnap.docs.map((d) => d.data().siteId).filter(Boolean))];

          if (siteIds.length === 0) {
            setSites([]);
            setLoading(false);
            return;
          }
          const sitesQ = query(
            collection(firebase_fs, "sites"),
            where(documentId(), "in", siteIds.slice(0, 10))
          );

          const sitesSnap = await getDocs(sitesQ);
          const memberSites = sitesSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((site) => site.deleted !== true)
            .sort((a, b) => {
              const ta = a.createdAt?.seconds ?? 0;
              const tb = b.createdAt?.seconds ?? 0;
              return tb - ta;
            });

          setSites(memberSites);
          setLoading(false);
        } catch (err) {
          setError(err);
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId]);
  return { sites, loading, error };
}