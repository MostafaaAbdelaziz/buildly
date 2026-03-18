import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import StatusCircle from "../components/StatusCircle";
import NeobrutalIconButton from "../components/NeobrutalIconButton";
import SiteActionsMenu from "../components/SiteActionsMenu";
import NeobrutalInfoCard, { InfoField, InfoSection } from "../components/NeobrutalInfoCard";
import { useRoute } from "@react-navigation/native";
import { useSiteDetail } from "../hooks/useSiteDetail";
import { useUserEmail } from "../hooks/useUserEmail";
import { useAuth } from "../context/AuthContext";
import { softDeleteSite } from "../services/siteRepository";
import { colors } from "../constants/theme";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

const DEV_HAS_SCHEDULES = true;

const MOCK_STATUS = "On Track";
const MOCK_DAYS = 42;
const MOCK_TASK = "Level 1 Drive All";
const MOCK_FOREMAN = "Mr. Bob";

export default function SiteDetailScreen({ navigation }) {
  const route = useRoute();
  const { siteId } = route.params || {};
  const { site, loading, error } = useSiteDetail(siteId);
  const { email: pmEmail, loading: pmLoading } = useUserEmail(site?.projectManagerId);
  const { role } = useAuth();
  const isManager = role === "manager";
  const tabBarPadding = useTabBarPadding();

  const [deleting, setDeleting] = useState(false);

  const address = site?.address || {};

  const handleDeleteSite = () => {
    Alert.alert(
      "Delete Site",
      `Are you sure you want to delete "${site.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await softDeleteSite(siteId);
              Alert.alert("Success", "Site deleted successfully");
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete site");
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView 
        contentContainerStyle={[styles.container, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {!siteId ? (
          <AppText variant="body" style={styles.errorText}>
            Missing site id.
          </AppText>
        ) : loading ? (
          <ActivityIndicator />
        ) : error ? (
          <AppText variant="body" style={styles.errorText}>
            {error.message || "Failed to load site."}
          </AppText>
        ) : !site ? (
          <AppText variant="body" style={styles.errorText}>
            Site not found.
          </AppText>
        ) : (
          <>
            <View style={styles.headerBlock}>
              {isManager && (
                <SiteActionsMenu
                  onInvite={() =>
                    navigation.navigate("InviteMember", { siteId, siteName: site.name })
                  }
                  onDelete={handleDeleteSite}
                />
              )}
              <AppText variant="title" bold style={styles.title}>
                {site.name}
              </AppText>
              <View style={styles.statusPill}>
                <AppText variant="caption" bold style={styles.statusText}>
                  {site.status || "ACTIVE"}
                </AppText>
              </View>
              {site.description ? (
                <AppText variant="body" style={styles.description}>
                  {site.description}
                </AppText>
              ) : null}
            </View>

            {/* VARIATION 1: STACKED - Classic Neobrutal */}
            <AppText variant="caption" style={styles.variantLabel}>
              VARIATION 1: STACKED
            </AppText>
            <NeobrutalInfoCard variant="stacked">
              <InfoSection title="Basics">
                <InfoField 
                  label="Project Manager" 
                  value={pmLoading ? "Loading..." : pmEmail ?? site.projectManagerId}
                />
                {(address.line1 || address.line2 || address.cityState) && (
                  <InfoField 
                    label="Address" 
                    value={[address.line1, address.line2, address.cityState].filter(Boolean).join(", ")}
                  />
                )}
              </InfoSection>
            </NeobrutalInfoCard>

            {/* VARIATION 2: SPLIT - Two-tone with accent strip */}
            <AppText variant="caption" style={styles.variantLabel}>
              VARIATION 2: SPLIT
            </AppText>
            <NeobrutalInfoCard variant="split" accentColor={colors.primary}>
              <InfoSection title="Basics">
                <InfoField 
                  label="Project Manager" 
                  value={pmLoading ? "Loading..." : pmEmail ?? site.projectManagerId}
                />
                {(address.line1 || address.line2 || address.cityState) && (
                  <InfoField 
                    label="Address" 
                    value={[address.line1, address.line2, address.cityState].filter(Boolean).join(", ")}
                  />
                )}
              </InfoSection>
            </NeobrutalInfoCard>

            {/* VARIATION 3: BADGE - Compact with colored border */}
            <AppText variant="caption" style={styles.variantLabel}>
              VARIATION 3: BADGE
            </AppText>
            <NeobrutalInfoCard variant="badge" accentColor={colors.accent}>
              <InfoSection title="Basics">
                <InfoField 
                  label="Project Manager" 
                  value={pmLoading ? "Loading..." : pmEmail ?? site.projectManagerId}
                />
                {(address.line1 || address.line2 || address.cityState) && (
                  <InfoField 
                    label="Address" 
                    value={[address.line1, address.line2, address.cityState].filter(Boolean).join(", ")}
                  />
                )}
              </InfoSection>
            </NeobrutalInfoCard>

            {/* VARIATION 4: ELEVATED - Extra emphasis with thick shadow */}
            <AppText variant="caption" style={styles.variantLabel}>
              VARIATION 4: ELEVATED
            </AppText>
            <NeobrutalInfoCard variant="elevated" accentColor={colors.primary}>
              <InfoSection title="Basics">
                <InfoField 
                  label="Project Manager" 
                  value={pmLoading ? "Loading..." : pmEmail ?? site.projectManagerId}
                />
                {(address.line1 || address.line2 || address.cityState) && (
                  <InfoField 
                    label="Address" 
                    value={[address.line1, address.line2, address.cityState].filter(Boolean).join(", ")}
                  />
                )}
              </InfoSection>
            </NeobrutalInfoCard>

            {!DEV_HAS_SCHEDULES ? (
              <Card style={styles.skeletonCard}>
                <NeobrutalIconButton
                  onPress={() => {
                    navigation.navigate("SiteSchedules", {
                      siteId,
                      siteName: site.name,
                    });
                  }}
                  style={styles.skeletonButton}
                />
                <AppText variant="caption" style={styles.skeletonLabel}>
                  Add Schedules
                </AppText>
              </Card>
            ) : (
              <>
                <View style={styles.circlesRow}>
                  <StatusCircle label={MOCK_STATUS} caption="status" />
                  <StatusCircle label={`${MOCK_DAYS} days`} caption="to completion" />
                </View>

                <View style={styles.cardsRow}>
                  <Card style={styles.infoCardHalf}>
                    <AppText variant="caption" style={styles.cardCaption}>
                      Current task
                    </AppText>
                    <AppText variant="body" bold>
                      {MOCK_TASK}
                    </AppText>
                  </Card>
                  <Card style={styles.infoCardHalf}>
                    <AppText variant="caption" style={styles.cardCaption}>
                      Foreman
                    </AppText>
                    <AppText variant="body" bold>
                      {MOCK_FOREMAN}
                    </AppText>
                  </Card>
                </View>

                <Card style={styles.summaryCard}>
                  <AppText variant="body" bold style={styles.summaryHeading}>
                    Summary
                  </AppText>
                  <AppText variant="body" style={styles.summaryPlaceholder}>
                    —
                  </AppText>
                </Card>

                <Button
                  variant="primary"
                  title="Open Blueprint"
                  onPress={() => navigation.navigate("SiteDrawings", { siteId, siteName: site?.name })}
                  fullWidth
                />
                <Button
                  variant="secondary"
                  title="Open Schedule"
                  onPress={() =>
                    navigation.navigate("SiteSchedules", {
                      siteId,
                      siteName: site.name,
                    })
                  }
                  fullWidth
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32, // Additional padding on top of tab bar padding
  },
  headerBlock: {
    marginBottom: 16,
  },
  title: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#ECECEC",
    marginBottom: 8,
  },
  statusText: {
    textTransform: "uppercase",
  },
  description: {
    opacity: 0.9,
  },
  infoCard: {
    marginBottom: 12,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  fieldLabel: {
    marginTop: 8,
    opacity: 0.7,
  },
  fieldValue: {
    fontWeight: "700",
  },
  skeletonCard: {
    marginTop: 12,
    marginBottom: 12,
    borderStyle: "dashed",
    alignItems: "center",
    paddingVertical: 24,
  },
  skeletonButton: {
    marginBottom: 8,
  },
  skeletonLabel: {
    opacity: 0.7,
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
    gap: 16,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  infoCardHalf: {
    flex: 1,
    marginBottom: 0,
  },
  cardCaption: {
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryCard: {
    marginBottom: 12,
  },
  summaryHeading: {
    marginBottom: 8,
  },
  summaryPlaceholder: {
    opacity: 0.5,
  },
  errorText: {
    color: "#B00020",
  },
  variantLabel: {
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.6,
    letterSpacing: 1,
  },
});
