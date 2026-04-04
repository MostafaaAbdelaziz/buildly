import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";
import { updateIssueStatus } from "../services/siteRepository";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../constants/theme";

const STATUSES = ["Open", "In Progress", "Resolved"];

function useFirestoreIssueRealtime(issueId) {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) {
      setIssue(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(firebase_fs, "issues", issueId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setIssue(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (e) => {
        console.warn("IssueDetailScreen listener:", e?.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [issueId]);

  return { issue, loading };
}

export default function IssueDetailScreen({ route, navigation }) {
  const issueId = route.params?.issueId ?? route.params?.issue?.id;
  const { issue, loading } = useFirestoreIssueRealtime(issueId);

  async function updateStatus(newStatus) {
    try {
      await updateIssueStatus(issueId, newStatus);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update issue status.");
    }
  }

  if (loading) {
    return (
      <Screen padding={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={({ pressed }) => [styles.backHit, pressed && styles.backPressed]}
        >
          <AppText variant="body" bold>← Back</AppText>
        </Pressable>
        <Button variant="secondary" title="Loading…" disabled />
      </Screen>
    );
  }

  if (!issue) {
    return (
      <Screen padding={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={({ pressed }) => [styles.backHit, pressed && styles.backPressed]}
        >
          <AppText variant="body" bold>← Back</AppText>
        </Pressable>
        <AppText variant="body">Issue not found.</AppText>
      </Screen>
    );
  }

  const isTrashed = issue.deleted === true;
  const createdAtLabel = issue.createdAt?.toDate
    ? issue.createdAt.toDate().toLocaleString()
    : issue.createdAt ?? "";

  return (
    <Screen padding={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backHit, pressed && styles.backPressed]}
        >
          <AppText variant="body" bold>← Back</AppText>
        </Pressable>

        {/* Title */}
        <AppText variant="title" bold style={styles.title}>
          {issue.title}
        </AppText>

        {/* Info block */}
        <Card style={styles.infoCard}>
          <AppText variant="caption" style={styles.fieldLabel}>Priority</AppText>
          <AppText variant="body" bold style={styles.fieldValue}>{issue.priority}</AppText>

          <AppText variant="caption" style={[styles.fieldLabel, styles.fieldSpaced]}>Status</AppText>
          <AppText variant="body" bold style={styles.fieldValue}>{issue.status}</AppText>

          <AppText variant="caption" style={[styles.fieldLabel, styles.fieldSpaced]}>Created</AppText>
          <AppText variant="body" style={styles.fieldValue}>{createdAtLabel}</AppText>

          <AppText variant="body" bold style={[styles.fieldLabel, styles.fieldSpaced]}>Description</AppText>
          <AppText variant="body" style={styles.fieldValue}>
            {issue.description || "No description provided."}
          </AppText>

          {issue.location?.latitude != null && issue.location?.longitude != null ? (
            <>
              <AppText variant="caption" style={[styles.fieldLabel, styles.fieldSpaced]}>Location</AppText>
              <AppText variant="body" style={styles.fieldValue}>
                {Number(issue.location.latitude).toFixed(5)}, {Number(issue.location.longitude).toFixed(5)}
              </AppText>
            </>
          ) : null}

          {issue.image ? (
            <Image source={{ uri: issue.image }} style={styles.photo} />
          ) : null}
        </Card>

        {/* Status update */}
        {!isTrashed && (
          <>
            <AppText variant="body" bold style={styles.sectionTitle}>
              Update status
            </AppText>
            <View style={styles.statusRow}>
              {STATUSES.map((status) => {
                const active = issue.status === status;
                return (
                  <View key={status} style={styles.statusBtn}>
                    <Button
                      title={status}
                      variant={active ? "primary" : "secondary"}
                      tone={status === "Open" ? "negative" : "positive"}
                      size="sm"
                      fullWidth
                      onPress={() => updateStatus(status)}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backHit: {
    paddingVertical: 4,
    paddingRight: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backPressed: {
    opacity: 0.7,
  },
  title: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  fieldLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
    marginBottom: 2,
  },
  fieldValue: {
    marginBottom: 4,
  },
  fieldSpaced: {
    marginTop: 10,
  },
  photo: {
    width: "100%",
    height: 220,
    borderRadius: 4,
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statusBtn: {
    flex: 1,
  },
});
