import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { useIssues } from "../context/IssuesContext";
import { updateIssueStatus } from "../services/siteRepository";

const STATUSES = ["Open", "In Progress", "Resolved"];

export default function IssueDetailScreen({ route, navigation }) {
  const { issue } = route.params;
  const { issues, trash, updateIssue, softDeleteIssue, restoreIssue } = useIssues();

  const currentIssue = useMemo(() => {
    return (
      (issues || []).find((i) => i.id === issue.id) ||
      (trash || []).find((i) => i.id === issue.id) ||
      issue
    );
  }, [issues, trash, issue]);

  const isTrashed = useMemo(() => {
    return (trash || []).some((i) => i.id === currentIssue.id);
  }, [trash, currentIssue.id]);

  async function updateStatus(newStatus) {
    try {
      await updateIssueStatus(currentIssue.id, newStatus);
      updateIssue(currentIssue.id, { status: newStatus });

      if (newStatus === "Resolved") {
        softDeleteIssue(currentIssue.id);
        navigation.goBack();
        return;
      }

      navigation.setOptions({ title: newStatus });
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update issue status.");
    }
  }

  function confirmRestore() {
    Alert.alert("Restore", "Restore this issue back to Current issues?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restore",
        onPress: () => {
          if (restoreIssue) restoreIssue(currentIssue.id);
          navigation.goBack();
        },
      },
    ]);
  }

  function confirmMoveToTrash() {
    Alert.alert("Move to Trash", "Do you want to move this issue to Trash?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Move",
        style: "destructive",
        onPress: () => {
          softDeleteIssue(currentIssue.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentIssue.title}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.line}>Priority: {currentIssue.priority}</Text>
        <Text style={styles.line}>Status: {currentIssue.status}</Text>
        <Text style={styles.line}>Created: {currentIssue.createdAt}</Text>

        <Text style={[styles.line, { marginTop: 10, fontWeight: "800" }]}>
          Description
        </Text>
        <Text style={{ marginBottom: 8 }}>
          {currentIssue.description || "No description provided."}
        </Text>

        {currentIssue.image ? (
          <Image source={{ uri: currentIssue.image }} style={styles.photo} />
        ) : null}
      </View>

      {!isTrashed && (
        <>
          <Text style={styles.sectionTitle}>Update status</Text>

          <View style={styles.row}>
            {STATUSES.map((status) => {
              const active = currentIssue.status === status;

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

      {isTrashed ? (
        <TouchableOpacity style={[styles.backBtn, styles.restoreBtn]} onPress={confirmRestore}>
          <Text style={styles.backText}>Restore Issue</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.backBtn, styles.trashBtn]} onPress={confirmMoveToTrash}>
          <Text style={styles.backText}>Move to Trash</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Issues</Text>
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

  trashBtn: {
    backgroundColor: "#B00020",
  },
  restoreBtn: {
    backgroundColor: "#0A7D2C",
  },
});