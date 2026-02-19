import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ScheduleContext = createContext(null);
const STORAGE_KEY = "schedule_v1";

export function ScheduleProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load once
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!isMounted) return;
        if (raw) setItems(JSON.parse(raw));
      } catch (e) {
        console.log("Failed to load schedule", e);
      } finally {
        if (isMounted) setLoaded(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save whenever items changes (after initial load)
  useEffect(() => {
    if (!loaded) return;

    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.log("Failed to save schedule", e);
      }
    })();
  }, [items, loaded]);

  function addItem({ title, date, time, location, notes }) {
    const newItem = {
      id: Date.now().toString(),
      title,
      date: date || "",
      time: time || "",
      location: location || "",
      notes: notes || "",
      status: "Planned",
      createdAt: new Date().toLocaleString(),
    };

    setItems((prev) => [newItem, ...prev]);
  }

  function toggleDone(id) {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, status: x.status === "Done" ? "Planned" : "Done" }
          : x
      )
    );
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function clearSchedule() {
    setItems([]);
  }

  const value = useMemo(
    () => ({ items, setItems, addItem, toggleDone, deleteItem, clearSchedule }),
    [items]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used inside ScheduleProvider");
  return ctx;
}