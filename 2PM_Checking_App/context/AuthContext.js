import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebase_auth } from "../firebaseConfig/firebaseConfig";
import { getUserRole } from "../services/userService";
import { set } from "firebase/database";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "manager" | "foreman"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebase_auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      await u?.reload();
      setUser(firebase_auth.currentUser); // refresh with latest data

      try {
        const r = await getUserRole(u.uid);
        setRole(r || "foreman"); // default if missing
      } catch (e) {
        console.log("AuthContext role load error:", e?.message);
        setRole("foreman");
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  const value = { user, role, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}