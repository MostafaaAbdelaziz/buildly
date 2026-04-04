import { useEffect, useState } from "react";
import { subscribeDailyCheckInsForSiteDate } from "../services/dailyCheckInRepository";

/**
 * Real-time list of check-in documents for a site on a given local calendar day (PM only).
 * @param {string | undefined} siteId
 * @param {string | undefined} localDate YYYY-MM-DD
 * @param {boolean} [enabled] when false, no subscription
 * @param {string | undefined} projectManagerId required when enabled (sites/{siteId}.projectManagerId)
 */
export function useDailyCheckInsForSite(siteId, localDate, enabled = true, projectManagerId) {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !siteId || !localDate || !projectManagerId) {
      setCheckIns([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeDailyCheckInsForSiteDate(
      siteId,
      localDate,
      projectManagerId,
      (rows) => {
        setCheckIns(rows);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsub;
  }, [siteId, localDate, enabled, projectManagerId]);

  return { checkIns, loading, error };
}
