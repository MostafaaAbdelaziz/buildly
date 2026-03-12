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

export function useSchedulePhases(scheduleId) {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!scheduleId) {
      setPhases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(firebase_fs, "schedule_items"),
      where("scheduleId", "==", scheduleId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const sa = a.sortOrder ?? a.createdAt?.seconds ?? 0;
            const sb = b.sortOrder ?? b.createdAt?.seconds ?? 0;
            return sa - sb;
          });
        setPhases(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [scheduleId]);

  const addPhase = useCallback(async (schedId, { name, description }) => {
    if (!schedId) throw new Error("Missing scheduleId.");
    await addDoc(collection(firebase_fs, "schedule_items"), {
      scheduleId: schedId,
      name: name.trim(),
      description: description?.trim() || null,
      sortOrder: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, []);

  const updatePhase = useCallback(async (id, fields) => {
    await updateDoc(doc(firebase_fs, "schedule_items", id), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deletePhase = useCallback(async (id) => {
    await deleteDoc(doc(firebase_fs, "schedule_items", id));
  }, []);

  return { phases, loading, error, addPhase, updatePhase, deletePhase };
}
