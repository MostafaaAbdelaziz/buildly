import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import WeatherRiskWidget from "../components/WeatherRiskWidget";
import DashboardCollapsibleSection from "../components/DashboardCollapsibleSection";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../hooks/useSites";
import { useNotifications } from "../hooks/useNotifications";
import { useSiteMembers } from "../hooks/useSiteMembers";
import Card from "../components/Card";
import AppText from "../components/AppText";
import NotificationsDrawer from "../components/NotificationsDrawer";
import { colors } from "../constants/theme";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

/**
 * Shared dashboard for foreman and subcontractor (see DashboardStack).
 * Matches PMDashboard layout; keeps notifications in a neobrutal header control.
 */
export default function ForemanDashboard({ navigation }) {
  const { user } = useAuth();
  const { sites, loading: sitesLoading } = useSites(user?.uid);
  const { notifications, markRead } = useNotifications(user?.uid);
  const { handleAccept, handleReject } = useSiteMembers({ uid: user?.uid, name: user?.email ?? "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sitesCollapsed, setSitesCollapsed] = useState(false);
  const [weatherCollapsed, setWeatherCollapsed] = useState(true);
  const tabBarPadding = useTabBarPadding();

  return (
    <Screen
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
        onViewIssue={(issueId) => {
          navigation.navigate("IssueDetail", {
            issue: {
              id: issueId,
              title: "",
              priority: "Medium",
              status: "Open",
              description: "",
              createdAt: "",
            },
          });
        }}
        onDismiss={(notif) => markRead(notif.id)}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="title" bold style={styles.screenTitle}>
            Dashboard
          </AppText>
          <NeobrutalNotificationButton
            count={notifications.length}
            onPress={() => setDrawerOpen(true)}
          />
        </View>

        <DashboardCollapsibleSection
          title="Sites"
          accentColor={colors.primary}
          collapsed={sitesCollapsed}
          onToggle={() => setSitesCollapsed((v) => !v)}
          style={styles.firstSection}
        >
          <View style={styles.sectionBody}>
            {sitesLoading ? (
              <AppText variant="body" style={styles.loadingText}>
                Loading sites...
              </AppText>
            ) : sites.length === 0 ? (
              <AppText variant="body" style={styles.emptyText}>
                No sites assigned yet.
              </AppText>
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
        </DashboardCollapsibleSection>

        <DashboardCollapsibleSection
          title="Weather"
          accentColor="#64748b"
          collapsed={weatherCollapsed}
          onToggle={() => setWeatherCollapsed((v) => !v)}
        >
          <WeatherRiskWidget />
        </DashboardCollapsibleSection>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

function NeobrutalNotificationButton({ count, onPress }) {
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const handlePressIn = () => {
    Animated.timing(translate, {
      toValue: { x: 4, y: 4 },
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(translate, {
      toValue: { x: 0, y: 0 },
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.notifWrapper}>
      <View style={styles.notifShadow} />
      <Pressable
        testID="header-notifications"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.notifPressable}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Animated.View
          style={[
            styles.notifFace,
            {
              transform: [{ translateX: translate.x }, { translateY: translate.y }],
            },
          ]}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </Animated.View>
      </Pressable>
      {count > 0 ? (
        <View style={styles.notifBadge}>
          <AppText variant="caption" bold style={styles.notifBadgeText}>
            {count > 9 ? "9+" : String(count)}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },

  header: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  screenTitle: {
    flex: 1,
    color: colors.text,
  },

  firstSection: {
    marginTop: 4,
  },

  sectionBody: {
    gap: 14,
  },

  notifWrapper: {
    position: "relative",
    width: 40,
    height: 40,
  },
  notifShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: "#919191",
    borderWidth: 3,
    borderColor: "#919191",
    borderRadius: 8,
  },
  notifPressable: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  notifFace: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: "#111",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#F6F4EE",
  },
  notifBadgeText: {
    color: colors.textOnPrimary,
    fontSize: 10,
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

  loadingText: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: 20,
  },
});
