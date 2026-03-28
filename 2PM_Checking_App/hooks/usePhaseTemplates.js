import { useCallback, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";
import { useAuth } from "../context/AuthContext";

/**
 * Provides phase template CRUD operations.
 * Templates are fetched on demand (not real-time) since they change infrequently.
 */
export function usePhaseTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [publicSnap, userSnap] = await Promise.all([
        getDocs(
          query(collection(firebase_fs, "phase_templates"), where("isPublic", "==", true))
        ),
        getDocs(
          query(
            collection(firebase_fs, "phase_templates"),
            where("createdById", "==", user.uid)
          )
        ),
      ]);

      const seen = new Set();
      const all = [];
      [...publicSnap.docs, ...userSnap.docs].forEach((d) => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          all.push({ id: d.id, ...d.data() });
        }
      });

      setTemplates(all.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Save a phase as a template.
   * @param {string} name - Template name
   * @param {Array} tasks - Array of task objects from the phase (title, description)
   * @param {boolean} isPublic - Whether to share with all users
   */
  const saveTemplate = useCallback(
    async (name, tasks, isPublic = false) => {
      if (!user) throw new Error("Not authenticated.");
      await addDoc(collection(firebase_fs, "phase_templates"), {
        name: name.trim(),
        createdById: user.uid,
        isPublic,
        tasks: tasks.map((t) => ({
          title: t.title,
          description: t.description || null,
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [user]
  );

  const deleteTemplate = useCallback(async (id) => {
    await deleteDoc(doc(firebase_fs, "phase_templates", id));
  }, []);

  return { templates, loading, fetchTemplates, saveTemplate, deleteTemplate };
}
