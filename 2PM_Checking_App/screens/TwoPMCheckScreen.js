import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../constants/theme";

export default function TwoPMCheckScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);

  const todayKey = user?.uid
    ? `2pm_check_${user.uid}_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`
    : `2pm_check_guest_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;

  const isTwoPM = hours === 14 && minutes < 60;

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(todayKey).then((value) => {
      if (value) {
        setHasAnsweredToday(true);
      }
    });
  }, [todayKey]);

  async function handleAnswer(isOnTrack) {
    await AsyncStorage.setItem(todayKey, isOnTrack ? "on_track" : "not_on_track");
    setHasAnsweredToday(true);
  }

  const bottomPad = Math.max(insets.bottom, 16) + 8;

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
              2:00 PM
            </AppText>
          </View>
        </View>

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
          <>
            <Card accent>
              <AppText variant="body" bold style={styles.cardTitle}>
                {"You're set for today"}
              </AppText>
              <AppText variant="body" style={styles.cardBody}>
                Thanks for checking in. Come back tomorrow at 2:00 PM for the next check-in.
              </AppText>
            </Card>
          </>
        ) : isTwoPM ? (
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
              onPress={() => handleAnswer(true)}
            />
            <Button
              title="Not ready"
              variant="primary"
              tone="negative"
              size="lg"
              fullWidth
              onPress={async () => {
                await handleAnswer(false);
                navigation.navigate("CreateIssue");
              }}
            />

            <Button
              title="Confirm with photo"
              variant="secondary"
              size="md"
              fullWidth
              onPress={() => navigation.navigate("CreateIssue")}
            />

            <Card accent>
              <AppText variant="caption" bold style={styles.reminderTitle}>
                Check-in window
              </AppText>
              <AppText variant="body">
                Daily check-in is due at 2:00 PM. Answer honestly so the team can act fast.
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
                The 2:00 PM check-in only runs during the 2:00 PM hour. Come back then to record
                READY or NOT READY.
              </AppText>
            </Card>
            <AppText variant="caption" style={styles.hint}>
              {"Tip: enable notifications so you don't miss the window."}
            </AppText>
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
    marginBottom: 20,
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
});
