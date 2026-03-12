import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export function useSiteSchedules(siteId) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!siteId) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(firebase_fs, "schedules"),
      where("siteId", "==", siteId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.createdAt?.seconds ?? 0;
            const tb = b.createdAt?.seconds ?? 0;
            return ta - tb;
          });
        setSchedules(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [siteId]);

  const addSchedule = useCallback(
    async (name) => {
      if (!siteId || !user) throw new Error("Missing siteId or user.");
      await addDoc(collection(firebase_fs, "schedules"), {
        siteId,
        name: name.trim(),
        createdById: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [siteId, user]
  );

  const updateSchedule = useCallback(async (id, fields) => {
    await updateDoc(doc(firebase_fs, "schedules", id), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deleteSchedule = useCallback(async (id) => {
    await deleteDoc(doc(firebase_fs, "schedules", id));
  }, []);

  return { schedules, loading, error, addSchedule, updateSchedule, deleteSchedule };
}
