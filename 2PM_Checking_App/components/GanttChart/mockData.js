import { toISO } from "./dateUtils";

const TASK_NAMES = [
  "Epic", "Backend", "Frontend", "QA", "Design", "API Gateway", "Database", "Auth",
  "Dashboard", "Reports", "Integrations", "Performance", "Security", "Docs", "Deploy", "Monitoring", "Support",
];
const TASK_COLORS = ["#93C5FD", "#86EFAC", "#FCD34D", "#D8B4FE", "#F9A8D4", "#A5B4FC", "#6EE7B7", "#FDE047", "#FDBA74", "#C4B5FD"];
const DURATIONS = [7, 4, 10, 5, 9, 3, 8, 6, 11, 4, 7, 12, 5, 6, 8, 10, 5, 7];

export function buildSequentialTasks() {
  const tasks = [];
  let start = new Date(2026, 1, 15);
  for (let i = 0; i < 18; i++) {
    const days = DURATIONS[i];
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    tasks.push({
      id: String(i + 1),
      name: TASK_NAMES[i],
      startDate: toISO(start),
      endDate: toISO(end),
      color: TASK_COLORS[i % TASK_COLORS.length],
    });
    start = end;
  }
  return tasks;
}

export const MOCK_TASKS = buildSequentialTasks();
