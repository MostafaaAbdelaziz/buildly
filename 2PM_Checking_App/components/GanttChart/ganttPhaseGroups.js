import { mapTaskToGanttRow } from "./ganttTaskUtils";

/** Distinct hues so consecutive phases read clearly on the chart */
export const PHASE_BAR_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#f97316",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
  "#84cc16",
  "#f43f5e",
];

const UNKNOWN_ID = "__unknown_phase__";
const UNSCHEDULED_ID = "__unscheduled__";

function sortTasksForGantt(tasks) {
  return [...tasks].sort((a, b) => {
    const aStart = a.startDate || "9999-12-31";
    const bStart = b.startDate || "9999-12-31";
    if (aStart < bStart) return -1;
    if (aStart > bStart) return 1;
    const aCreated = a.createdAt?.seconds || 0;
    const bCreated = b.createdAt?.seconds || 0;
    return aCreated - bCreated;
  });
}

/**
 * @param {Array} firestoreTasks - raw tasks from useSiteTasks
 * @param {Array<{ id: string, name: string }>} orderedPhases - from useSitePhasesOrdered
 * @returns {Array<{ phaseId: string|null, phaseName: string, barColor: string, tasks: Array }>}
 */
export function buildGanttPhaseGroups(firestoreTasks, orderedPhases) {
  const knownIds = new Set(orderedPhases.map((p) => p.id));
  const buckets = new Map();
  orderedPhases.forEach((p) => buckets.set(p.id, []));

  const unknown = [];
  const unscheduled = [];

  for (const t of firestoreTasks) {
    const sid = t.scheduleItemId;
    if (!sid) {
      unscheduled.push(t);
    } else if (buckets.has(sid)) {
      buckets.get(sid).push(t);
    } else {
      unknown.push(t);
    }
  }

  const groups = [];
  let colorIdx = 0;

  for (const p of orderedPhases) {
    const list = buckets.get(p.id) || [];
    const barColor = PHASE_BAR_COLORS[colorIdx % PHASE_BAR_COLORS.length];
    colorIdx += 1;
    groups.push({
      phaseId: p.id,
      phaseName: p.name,
      barColor,
      tasks: sortTasksForGantt(list).map((task) => mapTaskToGanttRow(task, barColor)),
    });
  }

  if (unknown.length > 0) {
    const barColor = PHASE_BAR_COLORS[colorIdx % PHASE_BAR_COLORS.length];
    colorIdx += 1;
    groups.push({
      phaseId: UNKNOWN_ID,
      phaseName: "Unknown phase",
      barColor,
      tasks: sortTasksForGantt(unknown).map((task) => mapTaskToGanttRow(task, barColor)),
    });
  }

  if (unscheduled.length > 0) {
    const barColor = PHASE_BAR_COLORS[colorIdx % PHASE_BAR_COLORS.length];
    groups.push({
      phaseId: UNSCHEDULED_ID,
      phaseName: "Unscheduled",
      barColor,
      tasks: sortTasksForGantt(unscheduled).map((task) => mapTaskToGanttRow(task, barColor)),
    });
  }

  return groups;
}
