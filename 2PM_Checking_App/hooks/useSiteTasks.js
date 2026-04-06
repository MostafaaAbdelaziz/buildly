import { useEffect, useMemo, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

/**
 * All tasks for a site (any phase or ad-hoc), ordered for timeline views.
 */
export function useSiteTasks(siteId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(firebase_fs, "tasks"), where("siteId", "==", siteId));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(items);
        setLoading(false);
      },
      () => {
        setTasks([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [siteId]);

  const orderedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aStart = a.startDate || "9999-12-31";
      const bStart = b.startDate || "9999-12-31";
      if (aStart < bStart) return -1;
      if (aStart > bStart) return 1;
      const aCreated = a.createdAt?.seconds || 0;
      const bCreated = b.createdAt?.seconds || 0;
      return aCreated - bCreated;
    });
  }, [tasks]);

  const updateTask = useCallback(async (id, fields) => {
    await updateDoc(doc(firebase_fs, "tasks", id), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deleteTask = useCallback(async (id) => {
    await deleteDoc(doc(firebase_fs, "tasks", id));
  }, []);

  return { tasks: orderedTasks, loading, updateTask, deleteTask };
}
