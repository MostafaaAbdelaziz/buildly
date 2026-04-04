import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Card from "../components/Card";
import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useSiteDetail } from "../hooks/useSiteDetail";
import { useActiveSiteMembers } from "../hooks/useActiveSiteMembers";
import { useDailyCheckInsForSite } from "../hooks/useDailyCheckInsForSite";
import { useUserEmail } from "../hooks/useUserEmail";
import {
  buildExpectedCheckInUserIds,
  getLocalDateString,
} from "../services/dailyCheckInRepository";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

function EmailLabel({ uid }) {
  const { email, loading } = useUserEmail(uid);
  return (
    <AppText variant="body" numberOfLines={1}>
      {loading ? "…" : email ?? uid}
    </AppText>
  );
}

const STATUS_LABEL = {
  on_track: "Ready / on track",
  not_on_track: "Not ready",
};

export default function SiteDailyCheckInScreen({ navigation }) {
  const route = useRoute();
  const { siteId, siteName } = route.params || {};
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarPadding = useTabBarPadding();
  const localDate = useMemo(() => getLocalDateString(), []);

  const { site, loading: siteLoading, error: siteError } = useSiteDetail(siteId);
  const { members, loading: membersLoading } = useActiveSiteMembers(siteId);
  const isPm = site && user && site.projectManagerId === user.uid;

  const { checkIns, loading: checkInsLoading, error: checkInsError } = useDailyCheckInsForSite(
    siteId,
    localDate,
    !!isPm,
    isPm ? site?.projectManagerId : undefined
  );

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const expectedIds = useMemo(() => buildExpectedCheckInUserIds(site, members), [site, members]);

  const statusByUserId = useMemo(() => {
    const m = {};
    for (const row of checkIns) {
      if (row.userId) {
        m[row.userId] = row.status;
      }
    }
    return m;
  }, [checkIns]);

  const checkedIn = useMemo(() => {
    return expectedIds.filter((uid) => statusByUserId[uid]);
  }, [expectedIds, statusByUserId]);

  const notCheckedIn = useMemo(() => {
    return expectedIds.filter((uid) => !statusByUserId[uid]);
  }, [expectedIds, statusByUserId]);

  const loading = siteLoading || membersLoading || (isPm && checkInsLoading);
  const bottomPad = Math.max(insets.bottom, 16) + tabBarPadding;

  if (!siteId) {
    return (
      <Screen padding={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <AppText variant="body" style={styles.errorText}>
          Missing site.
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen padding={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backHit, pressed && styles.backPressed]}
          >
            <AppText variant="body" bold>
              ← Back
            </AppText>
          </Pressable>
          <AppText variant="title" bold numberOfLines={1} style={styles.headerTitle}>
            Check-in status
          </AppText>
        </View>

        <AppText variant="caption" style={styles.dateLine}>
          {todayLabel}
        </AppText>
        <AppText variant="body" bold style={styles.siteLine}>
          {siteName || site?.name || "Site"}
        </AppText>

        {siteError || checkInsError ? (
          <AppText variant="body" style={styles.errorText}>
            {siteError?.message || checkInsError?.message || "Something went wrong."}
          </AppText>
        ) : !siteLoading && site && !isPm ? (
          <Card accent>
            <AppText variant="body">
              Only the project manager for this site can view today&apos;s check-in list.
            </AppText>
          </Card>
        ) : loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <AppText variant="caption" style={styles.hint}>
              Local date {localDate}. Roster includes the PM and all active site members.
            </AppText>

            <AppText variant="title" bold style={styles.sectionTitle}>
              Checked in ({checkedIn.length})
            </AppText>
            {checkedIn.length === 0 ? (
              <AppText variant="body" style={styles.empty}>
                No one yet.
              </AppText>
            ) : (
              checkedIn.map((uid) => (
                <Card key={uid} style={[styles.personCard, styles.cardGreen]}>
                  <EmailLabel uid={uid} />
                  <AppText variant="caption" style={styles.statusTag}>
                    {STATUS_LABEL[statusByUserId[uid]] ?? statusByUserId[uid]}
                  </AppText>
                </Card>
              ))
            )}

            <AppText variant="title" bold style={[styles.sectionTitle, styles.sectionSpaced]}>
              Not checked in ({notCheckedIn.length})
            </AppText>
            {notCheckedIn.length === 0 ? (
              <AppText variant="body" style={styles.empty}>
                Everyone on the roster has checked in.
              </AppText>
            ) : (
              notCheckedIn.map((uid) => (
                <Card key={uid} style={[styles.personCard, styles.cardRed]}>
                  <EmailLabel uid={uid} />
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  backHit: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  backPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    flex: 1,
  },
  dateLine: {
    marginBottom: 4,
  },
  siteLine: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionSpaced: {
    marginTop: 20,
  },
  personCard: {
    marginBottom: 8,
  },
  cardGreen: {
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  cardRed: {
    backgroundColor: "#fff1f2",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  statusTag: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  empty: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  hint: {
    marginBottom: 16,
    color: colors.textSecondary,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    color: "#B00020",
  },
});
