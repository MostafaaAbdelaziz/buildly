import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import StatusCircle from "../components/StatusCircle";
import NeobrutalIconButton from "../components/NeobrutalIconButton";
import { useRoute } from "@react-navigation/native";
import { useSiteDetail } from "../hooks/useSiteDetail";
import { useUserEmail } from "../hooks/useUserEmail";

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

  const address = site?.address || {};

  useEffect(() => {
    if (site?.name) {
      navigation.setOptions({ title: site.name });
    }
  }, [site?.name, navigation]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
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

            <Card style={styles.infoCard}>
              <AppText variant="body" bold style={styles.sectionLabel}>
                Basics
              </AppText>
              <AppText variant="caption" style={styles.fieldLabel}>
                Project manager
              </AppText>
              <AppText variant="body" style={styles.fieldValue}>
                {pmLoading ? "Loading..." : pmEmail ?? site.projectManagerId}
              </AppText>

              {address.line1 || address.line2 || address.cityState ? (
                <>
                  <AppText variant="caption" style={styles.fieldLabel}>
                    Address
                  </AppText>
                  {address.line1 ? (
                    <AppText variant="body" style={styles.fieldValue}>
                      {address.line1}
                    </AppText>
                  ) : null}
                  {address.line2 ? (
                    <AppText variant="body" style={styles.fieldValue}>
                      {address.line2}
                    </AppText>
                  ) : null}
                  {address.cityState ? (
                    <AppText variant="body" style={styles.fieldValue}>
                      {address.cityState}
                    </AppText>
                  ) : null}
                </>
              ) : null}
            </Card>

            {!DEV_HAS_SCHEDULES ? (
              <Card style={styles.skeletonCard}>
                <NeobrutalIconButton
                  onPress={() => {
                    navigation.navigate("Schedule");
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
                  onPress={() => navigation.navigate("Drawings")}
                  fullWidth
                />
                <Button
                  variant="secondary"
                  title="Open Schedule"
                  onPress={() => navigation.navigate("Schedule")}
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
    paddingBottom: 32,
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
});
