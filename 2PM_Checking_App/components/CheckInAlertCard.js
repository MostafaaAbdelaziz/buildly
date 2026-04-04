import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

/**
 * CheckInAlertCard
 *
 * Displayed inside NotificationsDrawer for CHECK_IN_ALERT notifications.
 * Shows who reported "not on track" and links to the issue if one was raised.
 *
 * Props:
 *  - notification  { id, siteName, reporterEmail, status, issueId, localDate }
 *  - onViewIssue   (issueId) => void — called when user taps "View issue"
 */
export default function CheckInAlertCard({ notification, onViewIssue }) {
  const { siteName, reporterEmail, status, issueId, localDate } = notification;

  return (
    <TouchableOpacity
      style={styles.wrapper}
      activeOpacity={issueId ? 0.7 : 1}
      onPress={issueId ? () => onViewIssue?.(issueId) : undefined}
    >
      <View style={styles.shadow} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <AppText variant="caption" bold style={styles.typeLabel}>
            CHECK-IN ALERT
          </AppText>
          <View style={styles.statusBadge}>
            <AppText variant="caption" bold style={styles.statusBadgeText}>
              NOT ON TRACK
            </AppText>
          </View>
        </View>

        <AppText variant="body" style={styles.message}>
          <AppText variant="body" bold>{reporterEmail || "A team member"}</AppText>
          {" reported the site "}
          <AppText variant="body" bold>"{siteName}"</AppText>
          {" is not on track"}
          {localDate ? ` on ${localDate}` : ""}.
        </AppText>

        {issueId ? (
          <TouchableOpacity
            style={styles.issueLink}
            onPress={() => onViewIssue?.(issueId)}
            activeOpacity={0.7}
          >
            <AppText variant="caption" bold style={styles.issueLinkText}>
              View linked issue →
            </AppText>
          </TouchableOpacity>
        ) : (
          <AppText variant="caption" style={styles.noIssueText}>
            No issue was raised with this report.
          </AppText>
        )}
      </View>
    </TouchableOpacity>
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
    backgroundColor: "#fff8f0",
    borderWidth: 2.5,
    borderColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typeLabel: {
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: "#fee2e2",
    borderWidth: 1.5,
    borderColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    color: "#b91c1c",
    letterSpacing: 0.5,
  },
  message: {
    lineHeight: 22,
    color: colors.text,
    marginBottom: 10,
  },
  issueLink: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "#111",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  issueLinkText: {
    color: colors.text,
    letterSpacing: 0.5,
  },
  noIssueText: {
    color: colors.textSecondary,
  },
});
