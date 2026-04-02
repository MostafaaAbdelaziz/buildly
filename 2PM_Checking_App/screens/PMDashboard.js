import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import Screen from "../components/Screen";
import WeatherRiskWidget from "../components/WeatherRiskWidget";
import { colors } from "../constants/theme";
import NeobrutalDialog from "../components/NeobrutalDialog";
import DashboardCollapsibleSection from "../components/DashboardCollapsibleSection";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../hooks/useSites";
import Card from "../components/Card";
import AppText from "../components/AppText";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

export default function PMDashboard({ navigation }) {
  const { user } = useAuth();
  const { sites, loading: sitesLoading } = useSites(user?.uid);
  const [sitesCollapsed, setSitesCollapsed] = useState(false);
  const [pmCheckCollapsed, setPmCheckCollapsed] = useState(true);
  const [weatherCollapsed, setWeatherCollapsed] = useState(true);
  const [issuesCollapsed, setIssuesCollapsed] = useState(true);
  const [showNewSiteDialog, setShowNewSiteDialog] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const tabBarPadding = useTabBarPadding();

  return (
    <Screen
      padding={{ paddingHorizontal: 0, paddingVertical: 0 }}
      style={{ backgroundColor: "#F6F4EE" }}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="title" bold style={styles.screenTitle}>
            Dashboard
          </AppText>
        </View>

        <DashboardCollapsibleSection
          title="Sites"
          accentColor={colors.primary}
          collapsed={sitesCollapsed}
          onToggle={() => setSitesCollapsed((v) => !v)}
          onAddPress={() => setShowNewSiteDialog(true)}
          style={styles.firstSection}
        >
          <View style={styles.sectionBody}>
            {sitesLoading ? (
              <AppText variant="body" style={styles.loadingText}>
                Loading sites...
              </AppText>
            ) : sites.length === 0 ? (
              <AppText variant="body" style={styles.emptyText}>
                No sites yet. Tap + to add one.
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
          title="2PM Check Status"
          accentColor="#16a34a"
          collapsed={pmCheckCollapsed}
          onToggle={() => setPmCheckCollapsed((v) => !v)}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.navRow}
            onPress={() => navigation.navigate("2PMCheck")}
          >
            <AppText variant="body" bold>
              Open today&apos;s check-in
            </AppText>
            <AppText variant="title" style={styles.chevronRight}>
              ›
            </AppText>
          </TouchableOpacity>
        </DashboardCollapsibleSection>

        <DashboardCollapsibleSection
          title="Weather"
          accentColor="#64748b"
          collapsed={weatherCollapsed}
          onToggle={() => setWeatherCollapsed((v) => !v)}
        >
          <WeatherRiskWidget />
        </DashboardCollapsibleSection>

        <DashboardCollapsibleSection
          title="Open issues"
          accentColor={colors.accent}
          collapsed={issuesCollapsed}
          onToggle={() => setIssuesCollapsed((v) => !v)}
        >
          <TouchableOpacity activeOpacity={0.85} style={styles.navRow}>
            <AppText variant="body" bold style={styles.issuesText}>
              5 open issues today
            </AppText>
            <AppText variant="title" style={styles.chevronRight}>
              ›
            </AppText>
          </TouchableOpacity>
        </DashboardCollapsibleSection>

        <View style={{ height: 24 }} />
      </ScrollView>

      <NeobrutalDialog
        visible={showNewSiteDialog}
        title="Add site"
        description="Name the site so your team recognizes it on the dashboard."
        value={newSiteName}
        onChangeText={setNewSiteName}
        onCancel={() => {
          setShowNewSiteDialog(false);
          setNewSiteName("");
        }}
        onOk={() => {
          if (!newSiteName.trim()) {
            setShowNewSiteDialog(false);
            return;
          }
          const trimmed = newSiteName.trim();
          setShowNewSiteDialog(false);
          setNewSiteName("");
          navigation.navigate("NewSite", { siteName: trimmed });
        }}
      />
    </Screen>
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
  },
  screenTitle: {
    color: colors.text,
  },

  firstSection: {
    marginTop: 4,
  },

  sectionBody: {
    gap: 14,
  },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  chevronRight: {
    fontSize: 22,
    color: colors.textSecondary,
    marginTop: Platform.OS === "ios" ? -1 : 0,
  },
  issuesText: {
    flex: 1,
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
