import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import AppText from "./AppText";
import Button from "./Button";
import { colors } from "../constants/theme";
import { ROLES } from "../constants/roles";

const UNDO_DURATION_MS = 5000;

// Display labels for roles
const ROLE_LABELS = {
  [ROLES.MANAGER]: "Manager",
  [ROLES.FOREMAN]: "Foreman",
  [ROLES.SUBCONTRACTOR]: "Sub",
};

/**
 * InviteNotificationCard
 *
 * Shows a site invitation with Accept (large primary) and Decline (small secondary) buttons.
 * On Decline: enters a 5-second undo window with an animated progress bar.
 * If the user taps "Undo" within 5s, the card resets to the invite view.
 * After 5s the rejection is finalised and the card fades out.
 *
 * Props:
 *  - notification  {id, siteName, inviterName, membershipId, ...}
 *  - onAccept      (notification) => void
 *  - onReject      (notification) => void
 */
export default function InviteNotificationCard({ notification, onAccept, onReject }) {
  const [phase, setPhase] = useState("invite"); // "invite" | "declining" | "done"
  const [countdown, setCountdown] = useState(Math.ceil(UNDO_DURATION_MS / 1000));

  const progressAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const progressAnimRef = useRef(null);
  const countdownRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
      progressAnimRef.current?.stop();
    };
  }, []);

  function startDeclineTimer() {
    progressAnim.setValue(1);
    setCountdown(Math.ceil(UNDO_DURATION_MS / 1000));

    // Animated shrink of progress bar
    progressAnimRef.current = Animated.timing(progressAnim, {
      toValue: 0,
      duration: UNDO_DURATION_MS,
      useNativeDriver: false,
    });
    progressAnimRef.current.start();

    // Tick countdown label every second
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Final rejection after timeout
    timerRef.current = setTimeout(() => {
      finaliseReject();
    }, UNDO_DURATION_MS);
  }

  function handleDecline() {
    setPhase("declining");
    startDeclineTimer();
  }

  function handleUndo() {
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
    progressAnimRef.current?.stop();
    progressAnim.setValue(1);
    setPhase("invite");
  }

  function finaliseReject() {
    setPhase("done");
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onReject(notification);
    });
  }

  if (phase === "done") return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      {/* Shadow layer */}
      <View style={styles.shadow} />

      <View style={styles.card}>
        {phase === "invite" ? (
          <>
            <AppText variant="caption" bold style={styles.typeLabel}>
              NEW SITE INVITATION
            </AppText>

            <AppText variant="body" style={styles.message}>
              <AppText variant="body" bold>{notification.inviterName}</AppText>
              {" invited you to join "}
              <AppText variant="body" bold>"{notification.siteName}"</AppText>
            </AppText>

            {notification.role ? (
              <View style={styles.rolePill}>
                <AppText variant="caption" bold style={styles.rolePillText}>
                  {ROLE_LABELS[notification.role] || notification.role}
                </AppText>
              </View>
            ) : null}

            <View style={styles.actionsRow}>
              <Button
                title="Decline"
                variant="secondary"
                size="sm"
                onPress={handleDecline}
                style={styles.declineBtn}
              />
              <Button
                title="Accept"
                variant="primary"
                tone="positive"
                size="lg"
                onPress={() => onAccept(notification)}
                style={styles.acceptBtn}
              />
            </View>
          </>
        ) : (
          // Declining phase — undo window
          <>
            <AppText variant="body" bold style={styles.declinedTitle}>
              Invitation declined.
            </AppText>

            {/* Animated progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>

            <View style={styles.undoRow}>
              <AppText variant="caption" style={styles.undoHint}>
                Reconsidering?
              </AppText>
              <TouchableOpacity onPress={handleUndo} style={styles.undoBtn} activeOpacity={0.7}>
                <AppText variant="caption" bold style={styles.undoBtnText}>
                  Undo ({countdown}s)
                </AppText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    marginBottom: 16,
  },
  shadow: {
    position: "absolute",
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    backgroundColor: "#111",
    borderWidth: 2.5,
    borderColor: "#111",
  },
  card: {
    backgroundColor: colors.neutral,
    borderWidth: 2.5,
    borderColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  typeLabel: {
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  message: {
    lineHeight: 22,
    marginBottom: 10,
    color: colors.text,
  },
  rolePill: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    borderWidth: 1.5,
    borderColor: "#93c5fd",
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 14,
  },
  rolePillText: {
    color: "#1d4ed8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  declineBtn: {
    minWidth: 80,
  },
  acceptBtn: {
    minWidth: 120,
  },

  // Declining phase
  declinedTitle: {
    color: colors.text,
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#e5e5e0",
    borderWidth: 1.5,
    borderColor: "#111",
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  undoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  undoHint: {
    color: colors.textSecondary,
  },
  undoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: "#111",
    backgroundColor: "#fff",
  },
  undoBtnText: {
    color: colors.text,
    letterSpacing: 0.5,
  },
});
