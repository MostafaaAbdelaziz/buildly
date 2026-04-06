import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import GanttChart from "../components/GanttChart/GanttChart";
import { buildGanttPhaseGroups } from "../components/GanttChart/ganttPhaseGroups";
import { mapTasksToGanttRows } from "../components/GanttChart/ganttTaskUtils";
import { layout } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../hooks/useSites";
import { useSitePhasesOrdered } from "../hooks/useSitePhasesOrdered";
import { useSiteTasks } from "../hooks/useSiteTasks";
import { addDaysISO } from "../utils/scheduleDateUtils";
import { writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

export default function GanttChartScreen() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = layout.floatingTabBarHeight + insets.bottom;
  const { user, role } = useAuth();
  const isManager = role === "manager";
  const { sites, loading: sitesLoading } = useSites(user?.uid);
  const [pickedSiteId, setPickedSiteId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const siteId = pickedSiteId ?? sites[0]?.id ?? null;
  const { tasks: firestoreTasks, loading: tasksLoading, updateTask, deleteTask } = useSiteTasks(siteId);
  const { orderedPhases, loading: phasesLoading } = useSitePhasesOrdered(siteId);

  const ganttTasks = useMemo(() => mapTasksToGanttRows(firestoreTasks), [firestoreTasks]);
  const phaseGroups = useMemo(
    () => (siteId ? buildGanttPhaseGroups(firestoreTasks, orderedPhases) : []),
    [firestoreTasks, orderedPhases, siteId]
  );

  const selectedSite = sites.find((s) => s.id === siteId);
  const loading = sitesLoading || (!!siteId && (tasksLoading || phasesLoading));

  // Sort helper matching ganttPhaseGroups order (startDate asc, then createdAt asc)
  const sortTasksForCascade = (tasks) =>
    [...tasks].sort((a, b) => {
      const aStart = a.startDate || "9999-12-31";
      const bStart = b.startDate || "9999-12-31";
      if (aStart < bStart) return -1;
      if (aStart > bStart) return 1;
      return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
    });

  const taskActions = useMemo(() => {
    if (!siteId || !isManager) return undefined;

    function resolveTaskMeta(taskId) {
      const task = firestoreTasks.find((t) => t.id === taskId);
      if (!task) return { phaseId: null, phaseName: null, followerCount: 0 };

      const phaseId = task.scheduleItemId || null;
      if (!phaseId) return { phaseId: null, phaseName: null, followerCount: 0 };

      const phaseObj = orderedPhases.find((p) => p.id === phaseId);
      const phaseName = phaseObj?.name || null;

      const tasksInPhase = sortTasksForCascade(
        firestoreTasks.filter((t) => t.scheduleItemId === phaseId)
      );
      const idx = tasksInPhase.findIndex((t) => t.id === taskId);
      const followerCount = idx >= 0 ? tasksInPhase.length - 1 - idx : 0;

      return { phaseId, phaseName, followerCount };
    }

    return {
      resolveTaskMeta,

      onDelayByDays: async ({ taskId, days, cascadePhase }) => {
        const task = firestoreTasks.find((t) => t.id === taskId);
        if (!task) throw new Error("Task not found.");

        const end = task.endDate || task.startDate;
        if (!end) {
          Alert.alert("Cannot delay", "This task has no dates yet. Add dates in the schedule first.");
          throw new Error("__cancel__");
        }
        const nextEnd = addDaysISO(end, days);
        if (!nextEnd) {
          Alert.alert("Error", "Could not compute the new end date.");
          throw new Error("__cancel__");
        }

        if (!cascadePhase) {
          // Single-task mode: same as before
          await updateTask(taskId, { endDate: nextEnd });
          return;
        }

        // Cascade mode: collect followers (tasks after this one in same phase)
        const phaseId = task.scheduleItemId;
        const phaseObj = orderedPhases.find((p) => p.id === phaseId);
        const phaseName = phaseObj?.name || "this phase";

        const tasksInPhase = sortTasksForCascade(
          firestoreTasks.filter((t) => t.scheduleItemId === phaseId)
        );
        const idx = tasksInPhase.findIndex((t) => t.id === taskId);
        const followers = idx >= 0 ? tasksInPhase.slice(idx + 1) : [];

        // Build confirmation message
        const dayLabel = days === 1 ? "1 day" : `${days} days`;
        const followerNames = followers.slice(0, 5).map((t) => `• ${t.title || "Untitled"}`);
        if (followers.length > 5) followerNames.push(`  +${followers.length - 5} more`);

        const message =
          `• ${task.title || "Untitled"} – end date +${days}\n\n` +
          (followers.length > 0
            ? `Also shifts ${followers.length} task${followers.length !== 1 ? "s" : ""} after it in ${phaseName}:\n${followerNames.join("\n")}\n\nEach task's start and end dates move forward by ${dayLabel}.`
            : `No other tasks come after it in ${phaseName}.`);

        await new Promise((resolve, reject) => {
          Alert.alert(
            `Add ${dayLabel} delay?`,
            message,
            [
              { text: "Cancel", style: "cancel", onPress: () => reject(new Error("__cancel__")) },
              {
                text: "Apply",
                onPress: async () => {
                  try {
                    const now = serverTimestamp();
                    const batch = writeBatch(firebase_fs);

                    // Selected task: end date only
                    batch.update(doc(firebase_fs, "tasks", taskId), {
                      endDate: nextEnd,
                      updatedAt: now,
                    });

                    // Followers: shift both start and end
                    for (const f of followers) {
                      const updates = { updatedAt: now };
                      if (f.startDate) updates.startDate = addDaysISO(f.startDate, days);
                      if (f.endDate) updates.endDate = addDaysISO(f.endDate, days);
                      if (updates.startDate || updates.endDate) {
                        batch.update(doc(firebase_fs, "tasks", f.id), updates);
                      }
                    }

                    await batch.commit();
                    resolve();
                  } catch (e) {
                    reject(e);
                  }
                },
              },
            ],
            { cancelable: true, onDismiss: () => reject(new Error("__cancel__")) }
          );
        });
      },

      onRename: async (taskId, title) => {
        await updateTask(taskId, { title });
      },
      onDelete: async (taskId) => {
        await deleteTask(taskId);
      },
    };
  }, [siteId, isManager, firestoreTasks, orderedPhases, updateTask, deleteTask]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={[styles.screen, { paddingBottom: tabBarSpace }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Timeline</Text>
        </View>

        <View style={styles.siteWrap}>
          <TouchableOpacity
            style={styles.siteButton}
            onPress={() => sites.length > 0 && setPickerOpen((v) => !v)}
            disabled={sites.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.siteButtonText} numberOfLines={1}>
              {selectedSite?.name || (sitesLoading ? "Loading…" : "No sites")}
            </Text>
            {sites.length > 0 ? <Text style={styles.chev}>{pickerOpen ? "▲" : "▼"}</Text> : null}
          </TouchableOpacity>

          {pickerOpen && sites.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {sites.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.dropItem}
                    onPress={() => {
                      setPickedSiteId(s.id);
                      setPickerOpen(false);
                    }}
                  >
                    <Text style={styles.dropItemText}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.chartWrap}>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#111" />
            </View>
          ) : null}

          {!sitesLoading && sites.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No construction sites</Text>
              <Text style={styles.emptySub}>
                Create a site from the dashboard to see its task schedule here.
              </Text>
            </View>
          ) : (
            <GanttChart
              key={siteId || "no-site"}
              title={selectedSite?.name?.trim() || "TIMELINE"}
              tasks={ganttTasks}
              phaseGroups={phaseGroups.length > 0 ? phaseGroups : undefined}
              taskActions={taskActions}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f6",
  },
  screen: {
    flex: 1,
    backgroundColor: "#f4f4f6",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  siteWrap: {
    paddingHorizontal: 16,
    marginBottom: 8,
    zIndex: 2,
  },
  siteButton: {
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e5ea",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  siteButtonText: {
    fontWeight: "700",
    opacity: 0.85,
    flex: 1,
    paddingRight: 10,
  },
  chev: { opacity: 0.5 },
  dropdown: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e5ea",
    overflow: "hidden",
  },
  dropItem: {
    padding: 12,
  },
  dropItemText: {
    fontWeight: "700",
    opacity: 0.85,
  },
  chartWrap: {
    flex: 1,
    position: "relative",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(244,244,246,0.65)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    opacity: 0.8,
  },
  emptySub: {
    marginTop: 8,
    fontWeight: "700",
    opacity: 0.5,
    textAlign: "center",
  },
});
