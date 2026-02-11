import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useIssues } from "../context/IssuesContext";

const STATUSES = ["Open", "In Progress", "Resolved"];

export default function IssueDetailScreen({ route, navigation }) {
  const { issue } = route.params; 
  const { issues, setIssues } = useIssues();

  // Always show the latest version of the issue from context
  const currentIssue = useMemo(() => {
    return issues.find((i) => i.id === issue.id) || issue;
  }, [issues, issue]);

  function updateStatus(newStatus) {
    if (!setIssues) {
      Alert.alert("Error", "setIssues is not available in IssuesContext. Add it to Provider value.");
      return;
    }

    if (newStatus === "Resolved") {
      setIssues((prev) => prev.filter((i) => i.id !== currentIssue.id));
      navigation.goBack();
      return;
    }
    
    setIssues((prev) =>
      prev.map((i) =>
        i.id === currentIssue.id ? { ...i, status: newStatus } : i
      )
    );

    
    navigation.setOptions({ title: newStatus });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentIssue.title}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.line}>Priority: {currentIssue.priority}</Text>
        <Text style={styles.line}>Status: {currentIssue.status}</Text>
        <Text style={styles.line}>Created: {currentIssue.createdAt}</Text>
      </View>

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
  },
  line: { marginBottom: 6 },

  sectionTitle: { marginTop: 18, fontWeight: "800" },

  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
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