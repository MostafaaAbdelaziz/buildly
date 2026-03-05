import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

export function useDrawingDetail(siteId, drawingId) {
  const [drawing, setDrawing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!siteId || !drawingId) {
      setDrawing(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ref = doc(firebase_fs, "sites", siteId, "drawings", drawingId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setDrawing({ id: snap.id, ...snap.data() });
        } else {
          setDrawing(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub && unsub();
  }, [siteId, drawingId]);

  return { drawing, loading, error };
}

