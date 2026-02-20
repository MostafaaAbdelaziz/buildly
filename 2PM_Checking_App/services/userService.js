import { ref, set, get } from "firebase/database";
import { firebase_db } from "../firebaseConfig/firebaseConfig";

export function saveUserRole(uid, role) {
  return set(ref(firebase_db, `users/${uid}`), {
    role, // "manager" or "foreman"
    createdAt: Date.now(),
  });
}

export async function getUserRole(uid) {
  const snap = await get(ref(firebase_db, `users/${uid}`));
  if (!snap.exists()) return null;
  const data = snap.val();
  return data?.role ?? null;
}