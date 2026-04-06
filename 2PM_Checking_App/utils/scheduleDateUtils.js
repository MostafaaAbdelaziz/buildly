/**
 * YYYY-MM-DD calendar helpers (local date, matches AddTaskForm / Gantt).
 */

/** Calendar add for YYYY-MM-DD strings */
export function addDaysISO(iso, delta) {
  if (!iso || typeof iso !== "string") return null;
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function parseISODate(iso) {
  if (!iso || typeof iso !== "string") return null;
  const parts = iso.trim().split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

/** Inclusive calendar days between two YYYY-MM-DD strings. If invalid or end before start, returns at least 1. */
export function inclusiveDaysBetween(isoStart, isoEnd) {
  const a = parseISODate(isoStart);
  const b = parseISODate(isoEnd);
  if (!a || !b) return 1;
  const msPerDay = 86400000;
  const diff = Math.round((b - a) / msPerDay);
  if (diff < 0) return 1;
  return diff + 1;
}

/** Duration (days) for template save from a live task. Defaults to 1. */
export function durationDaysFromTask(task) {
  const s = typeof task?.startDate === "string" ? task.startDate.trim() : "";
  const e = typeof task?.endDate === "string" ? task.endDate.trim() : "";
  if (s && e) return inclusiveDaysBetween(s, e);
  return 1;
}
