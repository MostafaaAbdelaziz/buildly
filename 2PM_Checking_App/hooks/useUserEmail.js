import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { firebase_db } from "../firebaseConfig/firebaseConfig";

export function useUserEmail(uid) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setEmail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    get(ref(firebase_db, `users/${uid}`))
      .then((snap) => {
        if (snap.exists()) {
          setEmail(snap.val()?.email ?? null);
        } else {
          setEmail(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("useUserEmail error:", err?.message);
        setEmail(null);
        setLoading(false);
      });
  }, [uid]);

  return { email, loading };
}
