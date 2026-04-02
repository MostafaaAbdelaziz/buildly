import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
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

export default function GanttChartScreen() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = layout.floatingTabBarHeight + insets.bottom;
  const { user } = useAuth();
  const { sites, loading: sitesLoading } = useSites(user?.uid);
  const [pickedSiteId, setPickedSiteId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const siteId = pickedSiteId ?? sites[0]?.id ?? null;
  const { tasks: firestoreTasks, loading: tasksLoading } = useSiteTasks(siteId);
  const { orderedPhases, loading: phasesLoading } = useSitePhasesOrdered(siteId);

  const ganttTasks = useMemo(() => mapTasksToGanttRows(firestoreTasks), [firestoreTasks]);
  const phaseGroups = useMemo(
    () => (siteId ? buildGanttPhaseGroups(firestoreTasks, orderedPhases) : []),
    [firestoreTasks, orderedPhases, siteId]
  );

  const selectedSite = sites.find((s) => s.id === siteId);
  const loading = sitesLoading || (!!siteId && (tasksLoading || phasesLoading));

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
