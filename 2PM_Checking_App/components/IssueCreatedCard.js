import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

/**
 * IssueCreatedCard
 *
 * Displayed inside NotificationsDrawer for ISSUE_CREATED notifications.
 * Shows who created an issue and provides a "View Issue →" button.
 *
 * Props:
 *  - notification  { id, siteName, reporterEmail, issueTitle, issueId }
 *  - onViewIssue   (issueId) => void
 *  - onDismiss     () => void
 */
export default function IssueCreatedCard({ notification, onViewIssue, onDismiss }) {
  const { siteName, reporterEmail, issueTitle, issueId } = notification;

  return (
    <View style={styles.wrapper}>
      <View style={styles.shadow} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <AppText variant="caption" bold style={styles.typeLabel}>
            NEW ISSUE
          </AppText>
          <View style={styles.headerRight}>
            {onDismiss && (
              <TouchableOpacity onPress={onDismiss} hitSlop={12} style={styles.dismissBtn}>
                <AppText variant="caption" bold style={styles.dismissText}>✕</AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <AppText variant="body" style={styles.message}>
          <AppText variant="body" bold>{reporterEmail || "A team member"}</AppText>
          {" created an issue on "}
          <AppText variant="body" bold>"{siteName}"</AppText>
          {issueTitle ? (
            <>
              {": "}
              <AppText variant="body" bold>{issueTitle}</AppText>
            </>
          ) : null}
        </AppText>

        {issueId ? (
          <TouchableOpacity
            style={styles.issueLink}
            onPress={() => onViewIssue?.(issueId)}
            activeOpacity={0.7}
          >
            <AppText variant="caption" bold style={styles.issueLinkText}>
              View Issue →
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
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
    backgroundColor: "#f0f4ff",
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dismissBtn: {
    padding: 2,
  },
  dismissText: {
    color: colors.textSecondary,
    fontSize: 16,
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
});
