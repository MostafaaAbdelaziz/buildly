import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import Screen from "../components/Screen";
import WeatherRiskWidget from "../components/WeatherRiskWidget";

// Demo data (replace with Firebase later)
const MOCK_PROJECTS = [
  { id: "p1", name: "Project CE4 5297 Red Street", status: "On Track" },
  { id: "p2", name: "Project CE4 5297 Red Street", status: "Delayed" },
  { id: "p3", name: "Project CE4 5297 Red Street", status: "Needs Attention" },
];

export default function PMDashboard({ navigation }) {
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);

  // Stable format: "Tue, March 3"
  const todayLabel = useMemo(() => {
    const d = new Date();
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const day = d.getDate();
    return `${weekday}, ${month} ${day}`;
  }, []);

  return (
    <Screen
      // override Screen background + padding to match mock
      padding={{ paddingHorizontal: 0, paddingVertical: 0 }}
      style={{ backgroundColor: "#F6F4EE" }}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>

            <TouchableOpacity activeOpacity={0.7} style={styles.dateRow}>
              <Text style={styles.dateText}>{todayLabel}</Text>
              <Text style={styles.dateChevron}>⌄</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* 2PM Check Status */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.statusRow}
          onPress={() => {
            navigation.navigate("2PMCheck");
          }}
        >
          <Text style={styles.statusRowText}>2PM Check Status</Text>

          <View style={styles.statusRight}>
            <Text style={styles.chevronRight}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Weather Risk Widget */}
        <WeatherRiskWidget />

        {/* Assigned Projects */}
        <SectionHeader
          title="Assigned Projects"
          collapsed={projectsCollapsed}
          onToggle={() => setProjectsCollapsed((v) => !v)}
        />

        {!projectsCollapsed && (
          <View style={styles.sectionBody}>
            {MOCK_PROJECTS.map((p) => (
              <ProjectCard
                key={p.id}
                name={p.name}
                status={p.status}
                onViewProject={() => navigation?.navigate?.("Map")}
                onViewSchedule={() => navigation?.navigate?.("Schedule")}
                onInfo={() => {}}
              />
            ))}
          </View>
        )}

        {/* Open issues today */}
        <TouchableOpacity activeOpacity={0.85} style={styles.issuesRow}>
          <Text style={styles.issuesIcon}>⚠️</Text>
          <Text style={styles.issuesText}>5 open issues today</Text>
          <Text style={styles.chevronRight}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

/* ---------- Small UI components ---------- */

function SectionHeader({ title, collapsed, onToggle }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Text style={styles.sectionChevron}>{collapsed ? "⌄" : "⌃"}</Text>
    </TouchableOpacity>
  );
}

function ProjectCard({ name, status, onViewProject, onViewSchedule, onInfo }) {
  return (
    <View style={styles.projectCard}>
      <View style={styles.projectTopRow}>
        <Text style={styles.projectName} numberOfLines={1}>
          {name}
        </Text>
        <StatusPill status={status} />
      </View>

      <View style={styles.projectDivider} />

      <View style={styles.projectButtonsRow}>
        <ActionButton icon="📁" label="View Project" onPress={onViewProject} />
        <ActionButton icon="📅" label="View Schedule" onPress={onViewSchedule} />
        <IconButton icon="ⓘ" onPress={onInfo} />
      </View>
    </View>
  );
}

function StatusPill({ status }) {
  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusPillText}>{status}</Text>
    </View>
  );
}

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.actionBtn}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function IconButton({ icon, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.iconBtn}>
      <Text style={styles.iconBtnText}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },

  header: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 46,
    fontWeight: "900",
    color: "#111",
  },
  dateRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 20,
    color: "#6B6B6B",
    fontWeight: "700",
  },
  dateChevron: {
    fontSize: 16,
    color: "#6B6B6B",
    marginTop: Platform.OS === "ios" ? 2 : 0,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: 20,
  },

  statusRow: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: "#ECECEC",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusRowText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },
  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pill: {
    backgroundColor: "#DCDCDC",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: {
    fontWeight: "900",
    color: "#555",
  },
  chevronRight: {
    fontSize: 22,
    color: "#666",
    marginTop: Platform.OS === "ios" ? -1 : 0,
  },

  sectionHeader: {
    marginTop: 18,
    marginHorizontal: 20,
    backgroundColor: "#ECECEC",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
  },
  sectionChevron: {
    fontSize: 16,
    color: "#555",
  },
  sectionBody: {
    marginHorizontal: 20,
    marginTop: 12,
    gap: 14,
  },

  projectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  projectTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  projectName: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
  },
  statusPill: {
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusPillText: {
    fontWeight: "900",
    color: "#555",
  },
  projectDivider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 14,
  },
  projectButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#ECECEC",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: { fontSize: 16 },
  actionText: { fontWeight: "900", color: "#222" },

  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 18, fontWeight: "900", color: "#222" },

  issuesRow: {
    marginTop: 18,
    marginHorizontal: 20,
    backgroundColor: "#F7F7F8",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  issuesIcon: { fontSize: 18 },
  issuesText: { flex: 1, fontSize: 20, fontWeight: "900", color: "#111" },
});