import React, { useState } from "react";
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useFirestoreIssues } from "../hooks/useFirestoreIssues";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../constants/theme";

export default function IssuesScreen({ navigation, route }) {
  const siteId = route?.params?.siteId || null;
  const siteName = route?.params?.siteName || "Site";
  const { role } = useAuth();
  const [tab, setTab] = useState("current");
  const isManager = role === "manager";

  const { issues, loading } = useFirestoreIssues(siteId);

  const currentIssues = issues.filter((issue) => issue.status?.toLowerCase() !== "resolved" && issue.status?.toLowerCase() !== "closed");
  const closedIssues = issues.filter((issue) => issue.status?.toLowerCase() === "resolved" || issue.status?.toLowerCase() === "closed");
  const data = tab === "current" ? currentIssues : closedIssues;

  function getPriorityColor(priority) {
    const p = priority?.toLowerCase();
    if (p === "high") return colors.accent;
    if (p === "medium") return "#f59e0b";
    return colors.textSecondary;
  }

  function getStatusBadgeStyle(status) {
    const s = status?.toLowerCase();
    if (s === "closed") {
      return { backgroundColor: colors.textSecondary, color: colors.textOnPrimary };
    }
    return { backgroundColor: colors.accent, color: colors.textOnPrimary };
  }

  function renderIssueCard({ item }) {
    const statusStyle = getStatusBadgeStyle(item.status);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("IssueDetail", { issue: item })}
        activeOpacity={0.7}
      >
        <Card style={styles.issueCard}>
          <View style={styles.cardHeader}>
            <AppText variant="body" bold numberOfLines={1} style={styles.cardTitle}>
              {item.title}
            </AppText>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <AppText variant="caption" style={{ color: statusStyle.color }}>
                {item.status?.toUpperCase()}
              </AppText>
            </View>
          </View>

          <View style={styles.cardMeta}>
            <View style={styles.priorityTag}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <AppText variant="caption" style={{ color: priorityColor }}>
                {item.priority}
              </AppText>
            </View>
            <AppText variant="caption">•</AppText>
            <AppText variant="caption">
          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : item.createdAt}
        </AppText>
          </View>

          {item.createdBy && (
            <AppText variant="caption" style={styles.createdBy}>
              By {item.createdBy}
            </AppText>
          )}
        </Card>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <Screen edges={[]}><ActivityIndicator style={{ marginTop: 40 }} /></Screen>
    );
  }

  return (
    <Screen edges={[]}>
      <View style={styles.header}>
        <AppText variant="title" bold>{siteName}</AppText>
        <Button
          variant="primary"
          tone="positive"
          title="+ Add"
          onPress={() =>
            navigation.navigate("CreateIssue", {
              siteId,
              siteName,
            })
          }
          size="sm"
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "current" && styles.activeTab]}
          onPress={() => setTab("current")}
          activeOpacity={0.8}
        >
          <AppText
            variant="body"
            bold
            style={[styles.tabText, tab === "current" && styles.activeTabText]}
          >
            Current ({currentIssues.length})
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === "closed" && styles.activeTab]}
          onPress={() => setTab("closed")}
          activeOpacity={0.8}
        >
          <AppText
            variant="body"
            bold
            style={[styles.tabText, tab === "closed" && styles.activeTabText]}
          >
            Closed ({closedIssues.length})
          </AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderIssueCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <AppText variant="body" style={styles.emptyText}>
              {tab === "current" ? "No open issues. Tap + Add to create one." : "No closed issues yet."}
            </AppText>
          </Card>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  tabs: {
    flexDirection: "row",
    borderWidth: 2.5,
    borderColor: colors.shadow || "#111",
    borderRadius: 0,
    marginBottom: 16,
    overflow: "hidden",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.neutral,
  },
  activeTab: {
    backgroundColor: colors.shadow || "#111",
  },
  tabText: {
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: colors.textOnPrimary,
  },

  listContent: {
    paddingBottom: 20,
  },

  issueCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  priorityTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  createdBy: {
    marginTop: 4,
  },

  emptyCard: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
  },
});