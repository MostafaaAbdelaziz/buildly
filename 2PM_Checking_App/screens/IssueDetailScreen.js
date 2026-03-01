import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { useIssues } from "../context/IssuesContext";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["Open", "In Progress", "Resolved"];

export default function IssueDetailScreen({ route, navigation }) {
  const { issue } = route.params;

  const { issues, updateIssue, softDeleteIssue } = useIssues();
  const { role } = useAuth();
  const isManager = role === "manager";

  const currentIssue = useMemo(() => {
    return issues.find((i) => i.id === issue.id) || issue;
  }, [issues, issue]);

  function handleChangeStatus(newStatus) {
    //  DON'T delete here
    updateIssue(currentIssue.id, { status: newStatus });
    navigation.setOptions({ title: newStatus });
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

      <Text style={styles.sectionTitle}>Update status</Text>

      <View style={styles.row}>
        {STATUSES.map((status) => {
          const active = currentIssue.status === status;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.btn, active && styles.btnActive]}
              onPress={() => handleChangeStatus(status)}
            >
              <Text style={[styles.btnText, active && styles.btnTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/*  Move to trash button */}
      <TouchableOpacity style={[styles.bigBtn, styles.trashBtn]} onPress={confirmMoveToTrash}>
        <Text style={styles.bigBtnText}>Move to Trash</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Issues</Text>
      </TouchableOpacity>

      {!isManager ? (
        <Text style={{ marginTop: 12, opacity: 0.6, fontWeight: "700" }}>
          Foreman view: only managers can permanently delete from Trash.
        </Text>
      ) : null}
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

  bigBtn: { marginTop: 14, padding: 14, borderRadius: 12 },
  trashBtn: { backgroundColor: "#B00020" },
  bigBtnText: { color: "white", fontWeight: "900", textAlign: "center" },

  backBtn: { marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: "#333" },
  backText: { color: "white", fontWeight: "700", textAlign: "center" },
});