import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../hooks/useSites";
import { useNotifications } from "../hooks/useNotifications";
import { useSiteMembers } from "../hooks/useSiteMembers";
import Card from "../components/Card";
import AppText from "../components/AppText";
import NotificationsDrawer from "../components/NotificationsDrawer";
import { colors } from "../constants/theme";

export default function ForemanDashboard({ navigation }) {
  const { user } = useAuth();
  const { sites, loading: sitesLoading } = useSites(user?.uid);
  const { notifications } = useNotifications(user?.uid);
  const { handleAccept, handleReject } = useSiteMembers({ uid: user?.uid, name: user?.email ?? "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      <NotificationsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        onAccept={async (notif) => {
          await handleAccept(notif.membershipId, notif.id);
        }}
        onReject={async (notif) => {
          await handleReject(notif.membershipId, notif.id);
        }}
      />

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

          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.7}
            onPress={() => setDrawerOpen(true)}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {notifications.length > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {notifications.length > 9 ? "9+" : notifications.length}
                </Text>
              </View>
            ) : null}
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

        {/* Sites */}
        <SectionHeader
          title="Sites"
          collapsed={projectsCollapsed}
          onToggle={() => setProjectsCollapsed((v) => !v)}
        />

        {!projectsCollapsed && (
          <View style={styles.sectionBody}>
            {sitesLoading ? (
              <AppText variant="body" style={styles.loadingText}>Loading sites...</AppText>
            ) : sites.length === 0 ? (
              <AppText variant="body" style={styles.emptyText}>No sites assigned yet.</AppText>
            ) : (
              sites.map((site) => (
                <TouchableOpacity
                  key={site.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("SiteDetail", { siteId: site.id })}
                >
                  <Card>
                    <View style={styles.siteCardHeader}>
                      <AppText variant="title" bold style={styles.siteName} numberOfLines={1}>
                        {site.name}
                      </AppText>
                      <View style={[styles.statusBadge, site.status === "ACTIVE" && styles.statusBadgeActive]}>
                        <AppText variant="caption" bold style={styles.statusBadgeText}>
                          {site.status || "ACTIVE"}
                        </AppText>
                      </View>
                    </View>
                    {site.description && (
                      <AppText variant="body" style={styles.siteDescription} numberOfLines={2}>
                        {site.description}
                      </AppText>
                    )}
                    {site.address && (
                      <AppText variant="caption" style={styles.siteAddress} numberOfLines={1}>
                        {[site.address.line1, site.address.cityState].filter(Boolean).join(", ")}
                      </AppText>
                    )}
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

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
  bellBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#F6F4EE",
  },
  bellBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
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

  siteCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  siteName: {
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.neutral,
    borderWidth: 1.5,
    borderColor: colors.neutralBorder,
  },
  statusBadgeActive: {
    backgroundColor: "#bbf7d0",
    borderColor: "#16a34a",
  },
  statusBadgeText: {
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  siteDescription: {
    marginBottom: 6,
    color: colors.textSecondary,
  },
  siteAddress: {
    color: colors.textSecondary,
  },

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

  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },
});