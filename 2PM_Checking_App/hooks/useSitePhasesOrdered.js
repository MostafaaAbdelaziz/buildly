import { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

/**
 * All schedule_items (phases) for a site, ordered by schedule creation then phase sortOrder.
 */
export function useSitePhasesOrdered(siteId) {
  const [schedules, setSchedules] = useState([]);
  const [phaseMap, setPhaseMap] = useState({});
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [phasesLoading, setPhasesLoading] = useState(true);

  useEffect(() => {
    if (!siteId) {
      setSchedules([]);
      setSchedulesLoading(false);
      return;
    }
    setSchedulesLoading(true);
    const q = query(collection(firebase_fs, "schedules"), where("siteId", "==", siteId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.createdAt?.seconds ?? 0;
            const tb = b.createdAt?.seconds ?? 0;
            return ta - tb;
          });
        setSchedules(docs);
        setSchedulesLoading(false);
      },
      () => {
        setSchedules([]);
        setSchedulesLoading(false);
      }
    );
    return () => unsub();
  }, [siteId]);

  useEffect(() => {
    if (!siteId || schedules.length === 0) {
      setPhaseMap({});
      setPhasesLoading(false);
      return;
    }

    setPhasesLoading(true);
    setPhaseMap({});

    const unsubs = schedules.map((sched) => {
      const q = query(
        collection(firebase_fs, "schedule_items"),
        where("scheduleId", "==", sched.id)
      );
      return onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const sa = a.sortOrder ?? a.createdAt?.seconds ?? 0;
              const sb = b.sortOrder ?? b.createdAt?.seconds ?? 0;
              return sa - sb;
            });
          setPhaseMap((prev) => ({ ...prev, [sched.id]: docs }));
        },
        () => {
          setPhaseMap((prev) => ({ ...prev, [sched.id]: [] }));
        }
      );
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [siteId, schedules]);

  useEffect(() => {
    if (!schedules.length) {
      setPhasesLoading(false);
      return;
    }
    const allLoaded = schedules.every((s) => phaseMap[s.id] !== undefined);
    if (allLoaded) {
      setPhasesLoading(false);
    }
  }, [schedules, phaseMap]);

  const orderedPhases = useMemo(() => {
    const out = [];
    for (const sched of schedules) {
      const phases = phaseMap[sched.id];
      if (!phases) continue;
      for (const p of phases) {
        out.push({
          id: p.id,
          name: p.name || "Phase",
          scheduleId: sched.id,
          sortOrder: p.sortOrder ?? 0,
        });
      }
    }
    return out;
  }, [schedules, phaseMap]);

  const loading = schedulesLoading || (!!siteId && schedules.length > 0 && phasesLoading);

  return { orderedPhases, loading };
}
