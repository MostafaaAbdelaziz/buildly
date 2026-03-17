import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

/**
 * Real-time listener for the current user's unread notifications.
 *
 * @param {string|null} userId - Firebase Auth UID of the current user
 * @returns {{ notifications: object[], markRead: (id: string) => Promise<void> }}
 */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(firebase_fs, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotifications(docs);
      },
      (err) => {
        console.warn("useNotifications error:", err);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  async function markRead(notificationId) {
    await updateDoc(doc(firebase_fs, "notifications", notificationId), {
      read: true,
    });
  }

  return { notifications, markRead };
}
