import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onValue, push, ref, remove, set, update } from "firebase/database";
import { firebase_auth, firebase_db } from "../firebaseConfig/firebaseConfig";

const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Listen to schedules for the signed-in user
  useEffect(() => {
    const user = firebase_auth.currentUser;

    // If not signed in yet, keep empty
    if (!user) {
      setItems([]);
      setLoaded(true);
      return;
    }

    setLoaded(false);
    const listRef = ref(firebase_db, `schedules/${user.uid}`);

    const unsub = onValue(
      listRef,
      (snap) => {
        const val = snap.val();
        const arr = val ? Object.values(val) : [];
        // newest first
        arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setItems(arr);
        setLoaded(true);
      },
      (err) => {
        console.log("Schedule listen error:", err?.message);
        setLoaded(true);
      }
    );

    return () => unsub();
  }, []);

  // Add schedule -> Firebase
  async function addItem({
    title,
    date,       // "YYYY-MM-DD"
    startTime,  // "HH:MM"
    endTime,    // "HH:MM"
    location,
    notes,
    crew,
  }) {
    const user = firebase_auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const listRef = ref(firebase_db, `schedules/${user.uid}`);
    const newRef = push(listRef);

    const newItem = {
      id: newRef.key,
      title: (title || "").trim(),
      date: (date || "").trim(),
      startTime: (startTime || "").trim(),
      endTime: (endTime || "").trim(),
      location: (location || "").trim(),
      notes: (notes || "").trim(),
      crew: (crew || "").trim() || "BL",
      status: "Planned",
      createdAt: Date.now(),
    };

    await set(newRef, newItem);
  }

  // Toggle done -> Firebase update
  async function toggleDone(id) {
    const user = firebase_auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const current = items.find((x) => x.id === id);
    if (!current) return;

    const itemRef = ref(firebase_db, `schedules/${user.uid}/${id}`);
    await update(itemRef, {
      status: current.status === "Done" ? "Planned" : "Done",
      updatedAt: Date.now(),
    });
  }

  // Delete item -> Firebase remove
  async function deleteItem(id) {
    const user = firebase_auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const itemRef = ref(firebase_db, `schedules/${user.uid}/${id}`);
    await remove(itemRef);
  }

  // Clear all schedules for user
  async function clearSchedule() {
    const user = firebase_auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const listRef = ref(firebase_db, `schedules/${user.uid}`);
    await remove(listRef);
  }

  const value = useMemo(
    () => ({
      items,
      loaded,
      addItem,
      toggleDone,
      deleteItem,
      clearSchedule,
      // keep setItems only if you REALLY need local UI updates (normally you don't)
      setItems,
    }),
    [items, loaded]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used inside ScheduleProvider");
  return ctx;
}