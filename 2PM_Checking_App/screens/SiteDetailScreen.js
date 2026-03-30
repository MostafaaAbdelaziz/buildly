import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Pressable } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import StatusCircle from "../components/StatusCircle";
import NeobrutalIconButton from "../components/NeobrutalIconButton";
import SiteActionsMenu from "../components/SiteActionsMenu";
import NeobrutalInfoCard, { InfoField, InfoSection, NeobrutalSmallCard } from "../components/NeobrutalInfoCard";
import { useRoute } from "@react-navigation/native";
import { useSiteDetail } from "../hooks/useSiteDetail";
import { useUserEmail } from "../hooks/useUserEmail";
import { useActiveSiteMembers } from "../hooks/useActiveSiteMembers";
import { useSiteMembers } from "../hooks/useSiteMembers";
import { useAuth } from "../context/AuthContext";
import { softDeleteSite, updateSiteForeman } from "../services/siteRepository";
import { useTabBarPadding } from "../hooks/useTabBarPadding";
import { useSiteCurrentTask } from "../hooks/useSiteCurrentTask";

const ROLE_LABELS = {
  FOREMAN: "Foreman",
  MANAGER: "Manager",
  SUBCONTRACTOR: "Sub",
  WORKER: "Worker",
};

function MemberRow({ member, onRemove, isManager }) {
  const { email, loading } = useUserEmail(member.userId);
  const roleLabel = ROLE_LABELS[member.role] ?? member.role;

  return (
    <View style={memberRowStyles.row}>
      <View style={memberRowStyles.info}>
        <AppText variant="body" bold numberOfLines={1} style={memberRowStyles.email}>
          {loading ? "Loading..." : email ?? member.userId}
        </AppText>
        <View style={memberRowStyles.rolePill}>
          <AppText variant="caption" bold style={memberRowStyles.roleText}>
            {roleLabel}
          </AppText>
        </View>
      </View>
      {isManager && (
        <TouchableOpacity
          onPress={() => onRemove(member)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={memberRowStyles.removeBtn}
        >
          <AppText variant="caption" style={memberRowStyles.removeText}>
            Remove
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const memberRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  info: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 8,
  },
  email: {
    flex: 1,
  },
  rolePill: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#374151",
  },
  removeBtn: {
    paddingHorizontal: 4,
  },
  removeText: {
    color: "#dc2626",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

const DEV_HAS_SCHEDULES = true;

const MOCK_STATUS = "On Track";
const MOCK_DAYS = 42;
const MOCK_FOREMAN = "Mr. Bob";

export default function SiteDetailScreen({ navigation }) {
  const route = useRoute();
  const { siteId } = route.params || {};
  const { site, loading, error } = useSiteDetail(siteId);
  const { email: pmEmail, loading: pmLoading } = useUserEmail(site?.projectManagerId);
  const { members, loading: membersLoading } = useActiveSiteMembers(siteId);
  const { user, role } = useAuth();
  const isManager = role === "manager";
  const tabBarPadding = useTabBarPadding();

  const { handleRemove } = useSiteMembers({ uid: user?.uid ?? "", name: user?.email ?? "" });

  const [deleting, setDeleting] = useState(false);

  const address = site?.address || {};

  const { currentTask, loading: currentTaskLoading } = useSiteCurrentTask(siteId);


  function handleEditForeman() {
    Alert.prompt(
      "Edit Foreman",
      "Enter the foreman's email:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (value) => {
            try {
              await updateSiteForeman(siteId, value);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to update foreman.");
            }
          },
        },
      ],
      "plain-text",
      site?.foremanEmail || ""
    );
  }

  const handleRemoveMember = (member) => {
    const displayName = member.email ?? member.userId;
    Alert.alert(
      "Remove Member",
      `Remove ${displayName} from this site?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await handleRemove(member.id);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to remove member.");
            }
          },
        },
      ]
    );
  };

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
                  <NeobrutalSmallCard 
                    variant="stacked"
                    label="Current task"
                    value={
                      currentTaskLoading
                        ? "Loading..."
                        : currentTask?.title || "No active tasks"
                    }
                    style={styles.smallCardHalf}
                  />
                  <Pressable
                    onPress={() => {
                      if (!isManager) return;
                      handleEditForeman();
                    }}
                    style={styles.smallCardHalf}
                  >
                    <NeobrutalSmallCard 
                      variant="stacked"
                      label="Foreman"
                      value={site?.foremanEmail || "Unassigned"}
                      style={styles.foremanPressableCard}
                    />
                  </Pressable>
                </View>

                <NeobrutalInfoCard variant="stacked">
                  <InfoSection title="Summary">
                    <AppText variant="body" style={styles.summaryPlaceholder}>
                      —
                    </AppText>
                  </InfoSection>
                </NeobrutalInfoCard>

                <View style={styles.buttonsRow}>
                  <Button
                    variant="primary"
                    title="Blueprint"
                    onPress={() => navigation.navigate("SiteDrawings", { siteId, siteName: site?.name })}
                    style={styles.blueprintButton}
                  />
                  <Button
                    variant="secondary"
                    title="Schedule"
                    onPress={() =>
                      navigation.navigate("SiteSchedules", {
                        siteId,
                        siteName: site.name,
                      })
                    }
                    style={styles.scheduleButton}
                  />
                </View>
              </>
            )}

            {/* Members Section */}

            {isManager && (
              <NeobrutalInfoCard variant="badge" accentColor="#16a34a">
                <InfoSection title={`Members (${membersLoading ? "…" : members.length})`}>
                  {membersLoading ? (
                    <ActivityIndicator style={{ marginTop: 8 }} />
                  ) : members.length === 0 ? (
                  <AppText variant="caption" style={styles.emptyMembers}>
                    No active members yet.
                  </AppText>
                ) : (
                  members.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      onRemove={handleRemoveMember}
                      isManager={isManager}
                    />
                  ))
                )}
                </InfoSection>
              </NeobrutalInfoCard>
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
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  blueprintButton: {
    flex: 1.4,
  },
  scheduleButton: {
    flex: 1,
  },
  summaryPlaceholder: {
    opacity: 0.5,
  },
  emptyMembers: {
    opacity: 0.5,
    marginTop: 4,
  },
  errorText: {
    color: "#B00020",
  },
  smallCardHalf: {
    flex: 1,
  },
});
