import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ScheduleContext = createContext(null);
const STORAGE_KEY = "schedule_v1";

export function ScheduleProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch (e) {
        console.log("Failed to load schedule", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save when items changes
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

  function addItem({
    title,
    date,       // "YYYY-MM-DD"
    startTime,  // "HH:MM"
    endTime,    // "HH:MM"
    location,
    notes,
    crew,
  }) {
    const newItem = {
      id: Date.now().toString(),
      title,
      date: (date || "").trim(),
      startTime: (startTime || "").trim(),
      endTime: (endTime || "").trim(),
      location: (location || "").trim(),
      notes: (notes || "").trim(),
      crew: (crew || "").trim() || "BL",
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

  return (
    <ScheduleContext.Provider
      value={{ items, setItems, addItem, toggleDone, deleteItem, clearSchedule }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used inside ScheduleProvider");
  return ctx;
}