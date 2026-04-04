import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../hooks/useSites";
import { useFirestoreIssuesBySites } from "../hooks/useFirestoreIssues";
import { useTabBarPadding } from "../hooks/useTabBarPadding";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../constants/theme";

function issueCreatedTime(issue) {
  const c = issue.createdAt;
  if (c?.toDate) return c.toDate().getTime();
  if (c?.seconds != null) return c.seconds * 1000;
  return 0;
}

function isClosedStatus(status) {
  const s = status?.toLowerCase();
  return s === "resolved" || s === "closed";
}

export default function AllIssuesScreen({ navigation }) {
  const { user } = useAuth();
  const { sites, loading: sitesLoading } = useSites(user?.uid);
  const siteIds = useMemo(() => sites.map((s) => s.id), [sites]);
  const siteNameById = useMemo(() => {
    const m = new Map();
    sites.forEach((s) => m.set(s.id, s.name || s.id));
    return m;
  }, [sites]);

  const { issues, loading: issuesLoading } = useFirestoreIssuesBySites(siteIds);
  const [tab, setTab] = useState("current");
  const tabBarPadding = useTabBarPadding();

  const loading = sitesLoading || issuesLoading;

  const currentIssues = useMemo(
    () => issues.filter((issue) => !isClosedStatus(issue.status)),
    [issues]
  );
  const closedIssues = useMemo(
    () => issues.filter((issue) => isClosedStatus(issue.status)),
    [issues]
  );

  const filtered = tab === "current" ? currentIssues : closedIssues;

  const sections = useMemo(() => {
    const bySite = new Map();
    for (const issue of filtered) {
      const sid = issue.siteId || "__unknown";
      if (!bySite.has(sid)) bySite.set(sid, []);
      bySite.get(sid).push(issue);
    }

    return Array.from(bySite.entries())
      .map(([siteId, data]) => {
        const sorted = [...data].sort(
          (a, b) => issueCreatedTime(b) - issueCreatedTime(a)
        );
        const title =
          siteId === "__unknown"
            ? "Unknown site"
            : siteNameById.get(siteId) ?? siteId;
        return { siteId, title, data: sorted };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [filtered, siteNameById]);

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
        onPress={() =>
          navigation.getParent()?.navigate("IssueDetail", { issue: item })
        }
        activeOpacity={0.7}
      >
        <Card style={styles.issueCard}>
          <View style={styles.cardHeader}>
            <AppText variant="body" bold numberOfLines={1} style={styles.cardTitle}>
              {item.title}
            </AppText>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <AppText variant="caption" style={{ color: statusStyle.color }}>
                {({ "In Progress": "ONGOING", Resolved: "DONE" }[item.status] ?? item.status?.toUpperCase())}
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
              {item.createdAt?.toDate
                ? item.createdAt.toDate().toLocaleDateString()
                : item.createdAt}
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
      <Screen>
        <ActivityIndicator style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title" bold>
          Issues
        </AppText>
        <Button
          variant="primary"
          title="+ Add"
          onPress={() => navigation.getParent()?.navigate("CreateIssue")}
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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderIssueCard}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <AppText variant="body" bold style={styles.sectionTitle}>
              {title}
            </AppText>
          </View>
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarPadding }]}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <AppText variant="body" style={styles.emptyText}>
              {tab === "current"
                ? "No open issues across your sites."
                : "No closed issues yet."}
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

  sectionHeader: {
    paddingBottom: 8,
    paddingTop: 4,
  },
  sectionTitle: {
    color: colors.textSecondary,
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
