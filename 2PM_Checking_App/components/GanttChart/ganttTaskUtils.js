const STATUS_COLORS = {
  DONE: "#9ca3af",
  IN_PROGRESS: "#22c55e",
  BLOCKED: "#f97316",
  PENDING: "#93c5fd",
};

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Maps Firestore task docs to the shape expected by GanttChart (name, startDate, endDate, color).
 * @param {string} [colorOverride] - if set, used instead of status color (e.g. phase bar color).
 */
export function mapTaskToGanttRow(task, colorOverride) {
  const t = todayISO();
  let start = task.startDate || task.endDate || t;
  let end = task.endDate || task.startDate || start;
  if (end < start) {
    const swap = start;
    start = end;
    end = swap;
  }
  const status = String(task.status || "PENDING").toUpperCase();
  const color =
    colorOverride ?? STATUS_COLORS[status] ?? STATUS_COLORS.PENDING;
  return {
    id: task.id,
    name: task.title?.trim() || "Untitled",
    startDate: start,
    endDate: end,
    color,
  };
}

export function mapTasksToGanttRows(tasks) {
  return tasks.map(mapTaskToGanttRow);
}
