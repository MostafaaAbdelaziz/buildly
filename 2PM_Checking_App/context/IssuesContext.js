import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const IssuesContext = createContext(null);

// ✅ bump version so old storage doesn't break if needed
const STORAGE_KEY = "issues_v4";

// how long deleted issues stay in trash (7 days)
const TRASH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function now() {
  return Date.now();
}

function prettyTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function sanitizeArray(v) {
  return Array.isArray(v) ? v : [];
}

export function IssuesProvider({ children }) {
  const [issues, setIssues] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ✅ Load once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const loadedIssues = sanitizeArray(parsed?.issues).map((item) => ({
            siteId: null,
            ...item,
          }));

          const loadedTrash = sanitizeArray(parsed?.trash).map((item) => ({
            siteId: null,
            ...item,
          }));

          // cleanup trash on load
          const cutoff = now() - TRASH_TTL_MS;
          const cleanedTrash = loadedTrash.filter((x) => (x.deletedAt || 0) >= cutoff);

          setIssues(loadedIssues);
          setTrash(cleanedTrash);
        }
      } catch (e) {
        console.log("Failed to load issues storage", e?.message);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ✅ Save whenever issues/trash changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const payload = JSON.stringify({ issues, trash });
        await AsyncStorage.setItem(STORAGE_KEY, payload);
      } catch (e) {
        console.log("Failed to save issues storage", e?.message);
      }
    })();
  }, [issues, trash, loaded]);

  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
      const cutoff = now() - TRASH_TTL_MS;
      setTrash((prev) => prev.filter((x) => (x.deletedAt || 0) >= cutoff));
    }, 60 * 1000); // every 1 minute

    return () => clearInterval(interval);
  }, [loaded]);

  function addIssue({ id, siteId, title, priority, description, image, location, createdBy, status }) {
  const newIssue = {
    siteId : siteId || null,
      id: id || `${now()}_${Math.random().toString(16).slice(2)}`,
    title: (title || "").trim(),
    description: (description || "").trim(),
    image: image || null,
    status: (status || "Open").trim(),
    priority: (priority || "Medium").trim(),
    createdAt: new Date().toLocaleString(),
    createdAtTs: now(),
    createdBy: createdBy || "Unknown",

    // ✅ SAVE LOCATION
    location: location
      ? {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        }
      : null,
  };

  setIssues((prev) => [newIssue, ...prev]);
}

  // ✅ update issue fields (status, priority, etc.)
  function updateIssue(id, patch) {
    if (!id) return;
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAtTs: now() } : i))
    );
  }

  // ✅ move issue to trash (soft delete)
  function softDeleteIssue(id) {
    if (!id) return;

    setIssues((prevIssues) => {
      const target = prevIssues.find((x) => x.id === id);
      if (!target) return prevIssues;

      // put into trash
      setTrash((prevTrash) => {
        const deletedAt = now();
        const trashed = {
          ...target,
          deletedAt,
          deletedAtPretty: prettyTime(deletedAt),
        };

        // avoid duplicates in trash
        const withoutDup = prevTrash.filter((t) => t.id !== id);
        return [trashed, ...withoutDup];
      });

      // remove from issues
      return prevIssues.filter((x) => x.id !== id);
    });
  }

  // ✅ restore issue from trash back to issues
  function restoreIssue(id) {
    if (!id) return;

    setTrash((prevTrash) => {
      const target = prevTrash.find((x) => x.id === id);
      if (!target) return prevTrash;

      setIssues((prevIssues) => {
        const restored = { ...target };
        delete restored.deletedAt;
        delete restored.deletedAtPretty;

        // avoid duplicates in issues
        const withoutDup = prevIssues.filter((i) => i.id !== id);
        return [restored, ...withoutDup];
      });

      return prevTrash.filter((x) => x.id !== id);
    });
  }

  // ✅ permanent delete (remove from trash forever)
  function permanentlyDeleteIssue(id) {
    if (!id) return;
    setTrash((prev) => prev.filter((x) => x.id !== id));
  }

  function clearIssues() {
    setIssues([]);
  }

  function clearTrash() {
    setTrash([]);
  }

  const value = useMemo(
    () => ({
      issues,
      trash,

      // keep if you still need it in some screens
      setIssues,

      addIssue,
      updateIssue,

      softDeleteIssue,
      restoreIssue,
      permanentlyDeleteIssue,

      clearIssues,
      clearTrash,
    }),
    [issues, trash]
  );

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>;
}

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error("useIssues must be used inside IssuesProvider");
  return ctx;
}