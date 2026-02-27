import { ref, push, set, onValue, update, remove } from "firebase/database";
import { firebase_db } from "../firebaseConfig/firebaseConfig";

export function addSchedule(uid, schedule) {
  const listRef = ref(firebase_db, `schedules/${uid}`);
  const newRef = push(listRef);

  const scheduleWithMeta = {
    ...schedule,
    id: newRef.key,
    createdAt: Date.now(),
  };

  return set(newRef, scheduleWithMeta);
}

export function listenToSchedules(uid, callback) {
  const listRef = ref(firebase_db, `schedules/${uid}`);

  const unsub = onValue(listRef, (snap) => {
    const val = snap.val();
    const arr = val ? Object.values(val) : [];
    arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(arr);
  });

  return unsub; // detach listener
}

export function updateSchedule(uid, scheduleId, patch) {
  const itemRef = ref(firebase_db, `schedules/${uid}/${scheduleId}`);
  return update(itemRef, { ...patch, updatedAt: Date.now() });
}

export function deleteSchedule(uid, scheduleId) {
  const itemRef = ref(firebase_db, `schedules/${uid}/${scheduleId}`);
  return remove(itemRef);
}