import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { updateIssueStatus } from "../services/siteRepository";
import { useFirestoreIssueById } from "../hooks/useFirestoreIssues";

const STATUSES = ["Open", "In Progress", "Resolved"];

export default function IssueDetailScreen({ route, navigation }) {
  const issueId = route.params?.issueId ?? route.params?.issue?.id;
  const { issue, loading } = useFirestoreIssueById(issueId);

  async function updateStatus(newStatus) {
    try {
      await updateIssueStatus(issueId, newStatus);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update issue status.");
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Issue not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isTrashed = issue.deleted === true;
  const createdAtLabel = issue.createdAt?.toDate
    ? issue.createdAt.toDate().toLocaleString()
    : issue.createdAt ?? "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{issue.title}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.line}>Priority: {issue.priority}</Text>
        <Text style={styles.line}>Status: {issue.status}</Text>
        <Text style={styles.line}>Created: {createdAtLabel}</Text>

        <Text style={[styles.line, { marginTop: 10, fontWeight: "800" }]}>Description</Text>
        <Text style={{ marginBottom: 8 }}>
          {issue.description || "No description provided."}
        </Text>

        {issue.image ? (
          <Image source={{ uri: issue.image }} style={styles.photo} />
        ) : null}
      </View>

      {!isTrashed && (
        <>
          <Text style={styles.sectionTitle}>Update status</Text>
          <View style={styles.row}>
            {STATUSES.map((status) => {
              const active = issue.status === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.btn, active && styles.btnActive]}
                  onPress={() => updateStatus(status)}
                >
                  <Text style={[styles.btnText, active && styles.btnTextActive]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },

  infoBlock: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "white",
  },
  line: { marginBottom: 6 },

  photo: { width: "100%", height: 220, borderRadius: 12, marginTop: 10 },

  sectionTitle: { marginTop: 18, fontWeight: "800" },

  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "white",
  },
  btnActive: { backgroundColor: "black", borderColor: "black" },
  btnText: { fontWeight: "700" },
  btnTextActive: { color: "white" },

  backBtn: {
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  backText: { color: "white", fontWeight: "700", textAlign: "center" },
});
