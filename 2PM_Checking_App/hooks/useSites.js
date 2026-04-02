import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
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

    let managerSites = [];
    let memberSites = [];
    
    const updateSites = () => {
      const merged = [...managerSites, ...memberSites]
        .filter((site) => site && site.deleted !== true)
        .filter(
          (site, index, arr) => arr.findIndex((s) => s.id === site.id) === index
        )
        .sort((a, b) => {
          const ta = a.createdAt?.seconds ?? 0;
          const tb = b.createdAt?.seconds ?? 0;
          return tb - ta;
        });

      setSites(merged);
      setLoading(false);
    };
    const managerQ = query(
      collection(firebase_fs, "sites"),
      where("projectManagerId", "==", userId)
    );
    const memberQ = query(
      collection(firebase_fs, "site_members"),
      where("userId", "==", userId),
      where("status", "==", "ACTIVE")
    );
    const unsubManager = onSnapshot(
      managerQ,
      (snap) => {
        managerSites = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        updateSites();
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    const unsubMembers = onSnapshot(
      memberQ,
      async (snap) => {
        try {
          const siteIds = [...new Set(snap.docs.map((d) => d.data().siteId).filter(Boolean))];
          if (siteIds.length === 0) {
            memberSites = [];
            updateSites();
            return;
          }
          const loadedSites = await Promise.all(
            siteIds.map(async (siteId) => {
              const siteSnap = await getDoc(doc(firebase_fs, "sites", siteId));
              return siteSnap.exists() ? { id: siteSnap.id, ...siteSnap.data() } : null;
            })
          );
          memberSites = loadedSites.filter(Boolean);
          updateSites();
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
    return () => {
      unsubManager();
      unsubMembers();
    };
  }, [userId]);
  return { sites, loading, error };
}