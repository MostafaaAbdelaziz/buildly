import React from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import { useRoute } from "@react-navigation/native";
import { useSiteDetail } from "../hooks/useSiteDetail";

export default function SiteDetailScreen() {
  const route = useRoute();
  const { siteId } = route.params || {};
  const { site, loading, error } = useSiteDetail(siteId);

  const address = site?.address || {};

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

            <View style={styles.infoCard}>
              <AppText variant="body" bold style={styles.sectionLabel}>
                Basics
              </AppText>
              <AppText variant="caption" style={styles.fieldLabel}>
                Project manager
              </AppText>
              <AppText variant="body" style={styles.fieldValue}>
                {site.projectManagerId || "Unknown"}
              </AppText>

              <AppText variant="caption" style={styles.fieldLabel}>
                Status
              </AppText>
              <AppText variant="body" style={styles.fieldValue}>
                {site.status || "ACTIVE"}
              </AppText>

              {site.startDate ? (
                <>
                  <AppText variant="caption" style={styles.fieldLabel}>
                    Start date
                  </AppText>
                  <AppText variant="body" style={styles.fieldValue}>
                    {String(site.startDate.toDate ? site.startDate.toDate() : site.startDate)}
                  </AppText>
                </>
              ) : null}
            </View>

            <View style={styles.infoCard}>
              <AppText variant="body" bold style={styles.sectionLabel}>
                Address
              </AppText>
              {address.line1 || address.line2 || address.cityState ? (
                <>
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
              ) : (
                <AppText variant="caption" style={styles.muted}>
                  No address on file yet.
                </AppText>
              )}
            </View>
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
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE",
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
  muted: {
    opacity: 0.6,
  },
  errorText: {
    color: "#B00020",
  },
});

