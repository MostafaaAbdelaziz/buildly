import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

export function useActiveSiteMembers(siteId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!siteId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(firebase_fs, "site_members"),
      where("siteId", "==", siteId),
      where("status", "==", "ACTIVE")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMembers(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [siteId]);

  return { members, loading, error };
}
