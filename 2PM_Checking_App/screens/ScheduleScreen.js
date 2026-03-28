import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const START_HOUR = 6;
const END_HOUR = 20;
const PX_PER_HOUR = 60;

const ROW_HEIGHT = 64;
const ROW_GAP = 14;

function pad2(n) {
  return String(n).padStart(2, "0");
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function timeToMinutes(t) {
  if (!t || typeof t !== "string" || !t.includes(":")) return null;
  const [hh, mm] = t.split(":");
  const h = Number(hh);
  const m = Number(mm);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}
function startOfWeekISO(iso) {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function addDaysISO(iso, add) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + add);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function ScheduleScreen({ navigation }) {
  const { items } = useSchedule();
  const { role } = useAuth();
  const isManager = role === "manager";

  const [projectOpen, setProjectOpen] = useState(false);
  const [project, setProject] = useState("Project CE4 5297 Red Street");
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const weekStart = useMemo(() => startOfWeekISO(selectedDate), [selectedDate]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDaysISO(weekStart, i)),
    [weekStart]
  );

  const tasksForSelectedDate = useMemo(() => {
    return items
      .filter((x) => x.date === selectedDate)
      .map((x) => {
        const startMin = timeToMinutes(x.startTime) ?? 9 * 60;
        const endMin = timeToMinutes(x.endTime) ?? startMin + 2 * 60;
        return { ...x, startMin, endMin: Math.max(endMin, startMin + 30) };
      })
      .sort((a, b) => a.startMin - b.startMin);
  }, [items, selectedDate]);

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const selectedTask = useMemo(() => {
    if (!tasksForSelectedDate.length) return null;
    return tasksForSelectedDate.find((t) => t.id === selectedTaskId) || tasksForSelectedDate[0];
  }, [tasksForSelectedDate, selectedTaskId]);

  const timelineWidth = (END_HOUR - START_HOUR) * PX_PER_HOUR;

  function minutesToX(mins) {
    const clamped = Math.max(START_HOUR * 60, Math.min(mins, END_HOUR * 60));
    return ((clamped - START_HOUR * 60) / 60) * PX_PER_HOUR;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <View style={styles.projectWrap}>
        <TouchableOpacity
          style={styles.projectButton}
          onPress={() => setProjectOpen((v) => !v)}
          activeOpacity={0.85}
        >
          <Text style={styles.projectText} numberOfLines={1}>{project}</Text>
          <Text style={styles.chev}>{projectOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {projectOpen && (
          <View style={styles.dropdown}>
            {["Project CE4 5297 Red Street", "Project Harbor View", "Project Downtown Tower"].map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.dropItem}
                onPress={() => {
                  setProject(p);
                  setProjectOpen(false);
                }}
              >
                <Text style={styles.dropItemText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.daysRow}>
        {weekDates.map((iso, idx) => {
          const active = iso === selectedDate;
          const dayNum = Number(iso.slice(-2));
          return (
            <TouchableOpacity
              key={iso}
              style={[styles.dayPill, active && styles.dayPillActive]}
              onPress={() => {
                setSelectedDate(iso);
                setSelectedTaskId(null);
              }}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>{DAYS[idx]}</Text>
              <Text style={[styles.dayNum, active && styles.dayTextActive]}>{dayNum}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add button only for manager */}
      <View style={styles.addRow}>
        {isManager ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("CreateSchedule")}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Foreman view</Text>
          </View>
        )}

        <Text style={styles.dateText}>{selectedDate}</Text>
      </View>

      <View style={styles.timelineOuter}>
        {tasksForSelectedDate.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No schedule items</Text>
            {isManager ? <Text style={styles.emptySub}>Tap “+ Add” to create one.</Text> : null}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: timelineWidth, paddingRight: 18 }}>
              <View style={styles.gridRow}>
                {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => {
                  const hour = START_HOUR + i;
                  return (
                    <View key={hour} style={[styles.hourCol, { width: PX_PER_HOUR }]}>
                      <View style={styles.hourLine} />
                      <Text style={styles.hourText}>{hour}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={{ marginTop: 12 }}>
                {tasksForSelectedDate.map((t, idx) => {
                  const x = minutesToX(t.startMin);
                  const w = Math.max(72, minutesToX(t.endMin) - minutesToX(t.startMin));
                  const y = idx * (ROW_HEIGHT + ROW_GAP);
                  const selected = t.id === selectedTask?.id;

                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setSelectedTaskId(t.id)}
                      onLongPress={() => {
                        // Only manager can open detail/edit screen
                        if (isManager) navigation.navigate("ScheduleDetail", { item: t });
                      }}
                      style={[
                        styles.taskBar,
                        { left: x, top: y, width: w, position: "absolute" },
                        selected && styles.taskBarSelected,
                        t.status === "Done" && styles.taskBarDone,
                      ]}
                    >
                      <View style={styles.taskLeft}>
                        <Text style={styles.taskIcon}>📌</Text>
                        <Text style={styles.taskTitle} numberOfLines={1}>{t.title}</Text>
                      </View>

                      <View style={styles.crewBubble}>
                        <Text style={styles.crewText}>{t.crew || "BL"}</Text>
                      </View>
                    </Pressable>
                  );
                })}

                <View style={{ height: tasksForSelectedDate.length * (ROW_HEIGHT + ROW_GAP) + 40 }} />
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {selectedTask && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (isManager) navigation.navigate("ScheduleDetail", { item: selectedTask });
          }}
          style={styles.detailCard}
        >
          <Text style={styles.detailTitle}>{selectedTask.title}</Text>

          <View style={styles.detailMetaRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Status: {selectedTask.status}</Text>
            </View>
            <Text style={styles.detailTime}>
              {selectedTask.startTime || "—"} - {selectedTask.endTime || "—"}
            </Text>
          </View>

          {!!selectedTask.location && (
            <Text style={styles.detailLocation}>📍 {selectedTask.location}</Text>
          )}

          <Text style={styles.detailNotesLabel}>Notes:</Text>
          <Text style={styles.detailNotes} numberOfLines={2}>
            {selectedTask.notes || "No notes yet."}
          </Text>

          {!isManager && (
            <Text style={{ marginTop: 10, fontWeight: "800", opacity: 0.5 }}>
              Only managers can edit schedules.
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4f4f6" },

  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 28, fontWeight: "900" },
  bell: { fontSize: 18, opacity: 0.7 },

  projectWrap: { paddingHorizontal: 16, marginBottom: 8 },
  projectButton: { backgroundColor: "white", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: "#e5e5ea", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  projectText: { fontWeight: "700", opacity: 0.85, flex: 1, paddingRight: 10 },
  chev: { opacity: 0.5 },

  dropdown: { marginTop: 8, backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: "#e5e5ea", overflow: "hidden" },
  dropItem: { padding: 12 },
  dropItemText: { fontWeight: "700", opacity: 0.85 },

  daysRow: { paddingHorizontal: 16, flexDirection: "row", gap: 10, marginBottom: 8 },
  dayPill: { flex: 1, backgroundColor: "white", borderRadius: 14, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "#e5e5ea" },
  dayPillActive: { backgroundColor: "#111", borderColor: "#111" },
  dayText: { fontWeight: "800", opacity: 0.7 },
  dayNum: { marginTop: 3, fontWeight: "800", opacity: 0.55 },
  dayTextActive: { color: "white", opacity: 1 },

  addRow: { paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  addBtn: { backgroundColor: "black", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  addText: { color: "white", fontWeight: "900" },
  dateText: { fontWeight: "800", opacity: 0.6 },

  roleBadge: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e5ea", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  roleBadgeText: { fontWeight: "900", opacity: 0.65 },

  timelineOuter: { marginTop: 6, marginHorizontal: 16, backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#e5e5ea", padding: 12, flex: 1 },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900", opacity: 0.8 },
  emptySub: { marginTop: 6, fontWeight: "700", opacity: 0.5 },

  gridRow: { flexDirection: "row", alignItems: "flex-end" },
  hourCol: { alignItems: "center" },
  hourLine: { height: 12, width: 1, backgroundColor: "#e5e5ea", marginBottom: 6 },
  hourText: { fontSize: 11, opacity: 0.5, fontWeight: "700" },

  taskBar: { height: 64, borderRadius: 18, paddingHorizontal: 14, backgroundColor: "#f3f3f5", borderWidth: 1, borderColor: "#ececf0", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  taskBarSelected: { borderColor: "#111" },
  taskBarDone: { opacity: 0.6 },

  taskLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 10 },
  taskIcon: { fontSize: 16 },
  taskTitle: { fontWeight: "800", opacity: 0.85, flex: 1 },

  crewBubble: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#ddd", alignItems: "center", justifyContent: "center" },
  crewText: { fontWeight: "900", opacity: 0.7 },

  detailCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: "white", borderRadius: 18, borderWidth: 1, borderColor: "#e5e5ea", padding: 14 },
  detailTitle: { fontSize: 20, fontWeight: "900" },

  detailMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  statusPill: { backgroundColor: "#f3f3f5", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  statusText: { fontWeight: "800", opacity: 0.75 },
  detailTime: { fontWeight: "800", opacity: 0.55 },

  detailLocation: { marginTop: 10, fontWeight: "800", opacity: 0.6 },
  detailNotesLabel: { marginTop: 12, fontWeight: "900", opacity: 0.7 },
  detailNotes: { marginTop: 6, fontWeight: "700", opacity: 0.55 },
});