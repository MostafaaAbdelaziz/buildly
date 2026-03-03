import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native";
import { useIssues } from "../context/IssuesContext";
import { useAuth } from "../context/AuthContext";

export default function IssuesScreen({ navigation }) {
  const { issues, trash, clearTrash } = useIssues();
  const { role } = useAuth();
  const isManager = role === "manager";

  function confirmEmptyTrash() {
    if (!isManager) {
      Alert.alert("Access denied", "Only managers can empty the trash.");
      return;
    }

    if (!trash || trash.length === 0) {
      Alert.alert("Trash", "Trash is already empty.");
      return;
    }

    Alert.alert("Empty Trash", "Delete all trashed issues permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Empty Trash",
        style: "destructive",
        onPress: () => clearTrash?.(),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Issues</Text>

        <View style={styles.headerBtns}>
          {/* Trash */}
          <TouchableOpacity
            style={styles.trashBtn}
            onPress={() => navigation.navigate("Trash")}
          >
            <Text style={styles.trashText}>
              Trash{trash?.length ? ` (${trash.length})` : ""}
            </Text>
          </TouchableOpacity>

          {/* Add */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("CreateIssue")}
          >
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional: Manager quick action */}
      {isManager ? (
        <TouchableOpacity style={styles.emptyTrashBtn} onPress={confirmEmptyTrash}>
          <Text style={styles.emptyTrashText}>Empty Trash (Manager)</Text>
        </TouchableOpacity>
      ) : null}

      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ opacity: 0.6 }}>No issues yet. Add one.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("IssueDetail", { issue: item })}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.status} • {item.priority}
            </Text>
            <Text style={styles.time}>{item.createdAt}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: { fontSize: 24, fontWeight: "800" },

  headerBtns: { flexDirection: "row", gap: 10 },

  addBtn: { backgroundColor: "black", padding: 10, borderRadius: 10 },
  addText: { color: "white", fontWeight: "700" },

  trashBtn: { backgroundColor: "#111", padding: 10, borderRadius: 10 },
  trashText: { color: "white", fontWeight: "800" },

  emptyTrashBtn: {
    backgroundColor: "#B00020",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  emptyTrashText: { color: "white", fontWeight: "900", textAlign: "center" },

  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  meta: { marginTop: 4 },
  time: { fontSize: 12, marginTop: 4, opacity: 0.6 },
});