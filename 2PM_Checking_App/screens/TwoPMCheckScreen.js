import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { doc, onSnapshot } from "firebase/firestore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../constants/theme";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";
import { useSiteDetail } from "../hooks/useSiteDetail";
import { useActiveSiteMembers } from "../hooks/useActiveSiteMembers";
import {
  getLocalDateString,
  makeDailyCheckInDocId,
  submitDailyCheckIn,
  userCanCheckInForSite,
} from "../services/dailyCheckInRepository";
import { createCheckInAlertNotification } from "../services/notificationRepository";

export default function TwoPMCheckScreen({ navigation }) {
  const route = useRoute();
  const { siteId, siteName } = route.params || {};
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const localDate = useMemo(() => getLocalDateString(), []);

  const { site, loading: siteLoading, error: siteError } = useSiteDetail(siteId);
  const { members, loading: membersLoading } = useActiveSiteMembers(siteId);

  // Use site's configured check-in hour, fall back to 14:00 (2PM)
  const checkInTimeObj = useMemo(() => {
    if (!site?.checkInTime) return { hour: 14, minute: 0 };
    const [h, m] = site.checkInTime.split(":").map(Number);
    return { hour: h, minute: m || 0 };
  }, [site?.checkInTime]);

  const isCheckInOpen = hours > checkInTimeObj.hour || (hours === checkInTimeObj.hour && minutes >= checkInTimeObj.minute);

  const displayTime = useMemo(() => {
    const d = new Date();
    d.setHours(checkInTimeObj.hour);
    d.setMinutes(checkInTimeObj.minute);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }, [checkInTimeObj]);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const canCheckIn = useMemo(
    () => userCanCheckInForSite(site, members, user?.uid),
    [site, members, user?.uid]
  );

  useEffect(() => {
    if (!siteId || !user?.uid) {
      setHasAnsweredToday(false);
      return;
    }
    const id = makeDailyCheckInDocId(siteId, localDate, user.uid);
    const ref = doc(firebase_fs, "daily_check_ins", id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setHasAnsweredToday(snap.exists());
      },
      (err) => {
        console.warn("TwoPMCheckScreen check-in listener:", err?.message);
      }
    );
    return () => unsub();
  }, [siteId, user?.uid, localDate]);

  async function handleAnswer(isOnTrack) {
    if (!siteId || !user?.uid) return;
    if (!site?.projectManagerId) {
      Alert.alert("Could not save", "This site is missing a project manager. Try reopening the site.");
      return;
    }
    setSubmitting(true);
    try {
      await submitDailyCheckIn(
        siteId,
        isOnTrack ? "on_track" : "not_on_track",
        user.uid,
        site.projectManagerId,
        localDate
      );

      if (!isOnTrack && site?.projectManagerId && site.projectManagerId !== user.uid) {
        // Write in-app alert to PM — fire and forget, don't block the user
        createCheckInAlertNotification(site.projectManagerId, {
          siteId,
          siteName: site.name ?? siteName ?? "",
          reporterUserId: user.uid,
          reporterEmail: user.email ?? "",
          localDate,
        }).then((notifId) => {
          // Navigate to CreateIssue with the notification id so it can link the issue back
          navigation.navigate("CreateIssue", {
            siteId,
            siteName: site.name ?? siteName ?? "",
            linkedNotificationId: notifId,
          });
        }).catch((e) => {
          console.warn("Failed to create check-in alert:", e?.message);
          // Still navigate even if notification write failed
          navigation.navigate("CreateIssue", {
            siteId,
            siteName: site.name ?? siteName ?? "",
          });
        });
      }
    } catch (e) {
      Alert.alert("Could not save", e?.message || "Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const bottomPad = Math.max(insets.bottom, 16) + 8;
  const displaySiteName = siteName || site?.name || "this site";
  const loading = siteLoading || membersLoading;

  if (!siteId) {
    return (
      <Screen padding={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backHit}>
          <AppText variant="body" bold>
            ← Back
          </AppText>
        </Pressable>
        <Card accent>
          <AppText variant="body">
            Open daily check-in from a site (choose a site on the dashboard, then use Daily check-in).
          </AppText>
        </Card>
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
              ←
            </AppText>
          </Pressable>
          <View style={styles.headerMain}>
            <AppText variant="title" bold>
              Bob
            </AppText>
            <AppText variant="caption" bold style={styles.timeLabel}>
              {displayTime}
            </AppText>
          </View>
        </View>

        <AppText variant="caption" style={styles.siteHint} numberOfLines={2}>
          Site: {displaySiteName}
        </AppText>

        {siteError ? (
          <AppText variant="body" style={styles.errorText}>
            {siteError.message || "Failed to load site."}
          </AppText>
        ) : loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : !site ? (
          <Card accent>
            <AppText variant="body">Site not found or was removed.</AppText>
          </Card>
        ) : !canCheckIn ? (
          <Card accent>
            <AppText variant="body">
              You don&apos;t have access to check in for this site. Ask your project manager to invite
              you.
            </AppText>
          </Card>
        ) : (
          <>
            <View style={styles.hero}>
              <AppText variant="body" style={styles.heroEmoji}>
                🏗️
              </AppText>
              <AppText variant="caption" style={styles.dateLine}>
                {todayLabel}
              </AppText>
              <AppText variant="title" bold style={styles.screenTitle}>
                Daily check-in
              </AppText>
            </View>

            {hasAnsweredToday ? (
              <Card accent>
                <AppText variant="body" bold style={styles.cardTitle}>
                  {"You're set for today"}
                </AppText>
                <AppText variant="body" style={styles.cardBody}>
                  Thanks for checking in. Come back tomorrow at {displayTime} for the next check-in.
                </AppText>
              </Card>
            ) : isCheckInOpen ? (
              <>
                <AppText variant="title" bold style={styles.question}>
                  Is the site ready?
                </AppText>

                <Button
                  title="Ready"
                  variant="primary"
                  tone="positive"
                  size="lg"
                  fullWidth
                  disabled={submitting}
                  loading={submitting}
                  onPress={() => handleAnswer(true)}
                />
                <Button
                  testID="checkin-not-ready"
                  title="Not ready"
                  variant="primary"
                  tone="negative"
                  size="lg"
                  fullWidth
                  disabled={submitting}
                  loading={submitting}
                  onPress={() => handleAnswer(false)}
                />

                <Button
                  title="Confirm with photo"
                  variant="secondary"
                  size="md"
                  fullWidth
                  disabled={submitting}
                  onPress={() =>
                    navigation.navigate("CreateIssue", {
                      siteId,
                      siteName: displaySiteName,
                    })
                  }
                />

                <Card accent>
                  <AppText variant="caption" bold style={styles.reminderTitle}>
                    Check-in window
                  </AppText>
                  <AppText variant="body">
                    Daily check-in opens at {displayTime}. Answer honestly so the team can act fast.
                  </AppText>
                </Card>
              </>
            ) : (
              <>
                <Card accent>
                  <AppText variant="body" bold style={styles.cardTitle}>
                    Not open yet
                  </AppText>
                  <AppText variant="body" style={styles.cardBody}>
                    The daily check-in opens at {displayTime}. Come back then to record
                    READY or NOT READY.
                  </AppText>
                </Card>
                <AppText variant="caption" style={styles.hint}>
                  {"Tip: enable notifications so you don't miss the window."}
                </AppText>
              </>
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
    gap: 8,
  },
  backHit: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  backPressed: {
    opacity: 0.7,
  },
  headerMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeLabel: {
    color: colors.text,
    letterSpacing: 0.5,
  },
  siteHint: {
    marginBottom: 16,
    color: colors.textSecondary,
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroEmoji: {
    marginBottom: 8,
    textAlign: "center",
  },
  dateLine: {
    textAlign: "center",
    marginBottom: 4,
  },
  screenTitle: {
    textAlign: "center",
  },
  question: {
    textAlign: "center",
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardBody: {
    color: colors.textSecondary,
  },
  reminderTitle: {
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  hint: {
    textAlign: "center",
    marginTop: 8,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    color: "#B00020",
  },
});
