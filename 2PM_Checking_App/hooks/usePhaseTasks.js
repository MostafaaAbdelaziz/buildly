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

/**
 * Subscribes to tasks for a given phase (scheduleItemId).
 * Pass scheduleItemId=null to get ad-hoc (unscheduled) tasks for the site.
 */
export function usePhaseTasks(scheduleItemId, siteId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const isAdHoc = scheduleItemId == null;

    if (!isAdHoc && !scheduleItemId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    if (isAdHoc && !siteId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = isAdHoc
      ? query(
          collection(firebase_fs, "tasks"),
          where("siteId", "==", siteId),
          where("scheduleItemId", "==", null)
        )
      : query(
          collection(firebase_fs, "tasks"),
          where("scheduleItemId", "==", scheduleItemId)
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
        setTasks(docs);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [scheduleItemId, siteId]);

  const addTask = useCallback(
    async (taskData) => {
      if (!siteId || !user) throw new Error("Missing siteId or user.");
      const { title, description, startDate, endDate, assignedTo } = taskData;
      await addDoc(collection(firebase_fs, "tasks"), {
        siteId,
        scheduleItemId: scheduleItemId ?? null,
        title: title.trim(),
        description: description?.trim() || null,
        status: "PENDING",
        startDate: startDate || null,
        endDate: endDate || null,
        assignedTo: assignedTo || null,
        createdById: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [siteId, scheduleItemId, user]
  );

  const updateTask = useCallback(async (id, fields) => {
    await updateDoc(doc(firebase_fs, "tasks", id), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deleteTask = useCallback(async (id) => {
    await deleteDoc(doc(firebase_fs, "tasks", id));
  }, []);

  return { tasks, loading, addTask, updateTask, deleteTask };
}
