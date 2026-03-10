import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

export function useSiteDetail(siteId) {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!siteId) {
      setSite(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ref = doc(firebase_fs, "sites", siteId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setSite({ id: snap.id, ...snap.data() });
        } else {
          setSite(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub && unsub();
  }, [siteId]);

  return { site, loading, error };
}

