import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const IssuesContext = createContext(null);
const STORAGE_KEY = "issues_v1";

export function IssuesProvider({ children }) {
  const [issues, setIssues] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setIssues(JSON.parse(raw));
      } catch (e) {
        console.log("Failed to load issues", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save whenever issues changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
      } catch (e) {
        console.log("Failed to save issues", e);
      }
    })();
  }, [issues, loaded]);

  function addIssue({ title, priority }) {
    const newIssue = {
      id: Date.now().toString(),
      title,
      status: "Open",
      priority: priority || "Medium",
      createdAt: new Date().toLocaleString(),
    };
    setIssues((prev) => [newIssue, ...prev]);
  }

  function clearIssues() {
    setIssues([]);
  }

  return (
    <IssuesContext.Provider value={{ issues, addIssue, clearIssues }}>
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error("useIssues must be used inside IssuesProvider");
  return ctx;
}