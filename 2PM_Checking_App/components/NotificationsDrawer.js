import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import InviteNotificationCard from "./InviteNotificationCard";
import CheckInAlertCard from "./CheckInAlertCard";
import { colors } from "../constants/theme";

/**
 * NotificationsDrawer
 *
 * A bottom-anchored modal sheet that lists all unread notifications.
 * Currently renders SITE_INVITE notifications via InviteNotificationCard.
 *
 * Props:
 *  - visible       boolean
 *  - onClose       () => void
 *  - notifications array of notification objects
 *  - onAccept      (notification) => void  — for SITE_INVITE
 *  - onReject      (notification) => void  — for SITE_INVITE
 *  - onViewIssue   (issueId) => void       — for CHECK_IN_ALERT
 */
export default function NotificationsDrawer({
  visible,
  onClose,
  notifications = [],
  onAccept,
  onReject,
  onViewIssue,
}) {
  const inviteNotifs = notifications.filter((n) => n.type === "SITE_INVITE");
  const alertNotifs = notifications.filter((n) => n.type === "CHECK_IN_ALERT");

  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* Tap backdrop to close */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <AppText variant="title" bold style={styles.title}>
              Notifications
            </AppText>
          </View>
          {notifications.length > 0 ? (
            <View style={styles.badgeCount}>
              <AppText variant="caption" bold style={styles.badgeCountText}>
                {notifications.length}
              </AppText>
            </View>
          ) : null}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <AppText variant="body" bold style={styles.closeBtnText}>
              ✕
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {inviteNotifs.length === 0 && alertNotifs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={40} color={colors.textSecondary} />
              <AppText variant="body" style={styles.emptyText}>
                No new notifications
              </AppText>
              <AppText variant="caption" style={styles.emptySubtext}>
                Site invitations and check-in alerts will appear here.
              </AppText>
            </View>
          ) : (
            <>
              {alertNotifs.map((notif) => (
                <CheckInAlertCard
                  key={notif.id}
                  notification={notif}
                  onViewIssue={(issueId) => {
                    onClose();
                    onViewIssue?.(issueId);
                  }}
                />
              ))}
              {inviteNotifs.map((notif) => (
                <InviteNotificationCard
                  key={notif.id}
                  notification={notif}
                  onAccept={(n) => onAccept(n)}
                  onReject={(n) => onReject(n)}
                />
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#F6F4EE",
    borderTopWidth: 3,
    borderTopColor: "#111",
    borderLeftWidth: 3,
    borderLeftColor: "#111",
    borderRightWidth: 3,
    borderRightColor: "#111",
    paddingTop: 10,
    paddingBottom: 36,
    maxHeight: "75%",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e5e0",
    gap: 8,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  title: {
    flex: 1,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  badgeCount: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeCountText: {
    color: "#fff",
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtext: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
