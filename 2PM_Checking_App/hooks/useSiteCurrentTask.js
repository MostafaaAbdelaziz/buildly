import { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

export function useSiteCurrentTask(siteId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(firebase_fs, "tasks"),
      where("siteId", "==", siteId)
    );

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
      (error) => {
        console.log("useSiteCurrentTask error:", error);
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

  const currentTask =
    orderedTasks.find((task) => task.status !== "DONE") || null;

  return {
    currentTask,
    tasks: orderedTasks,
    loading,
  };
}