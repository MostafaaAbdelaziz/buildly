import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from "react-native";
import { useIssues } from "../context/IssuesContext";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrashScreen({ navigation }) {
  const { trash, restoreIssue, permanentlyDeleteIssue, clearTrash } = useIssues();
  const { role } = useAuth();
  const isManager = role === "manager";

  function confirmEmptyTrash() {
    if (!isManager) {
      Alert.alert("Access denied", "Only managers can empty the trash.");
      return;
    }

    if (!trash?.length) {
      Alert.alert("Trash", "Trash is already empty.");
      return;
    }

    Alert.alert("Empty Trash", "Delete all trashed issues permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Empty",
        style: "destructive",
        onPress: () => clearTrash?.(),
      },
    ]);
  }

  function confirmPermanentDelete(id) {
    if (!isManager) {
      Alert.alert("Access denied", "Only managers can permanently delete.");
      return;
    }

    Alert.alert("Delete permanently", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => permanentlyDeleteIssue?.(id),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Trash</Text>

        {isManager ? (
          <TouchableOpacity style={styles.emptyBtn} onPress={confirmEmptyTrash}>
            <Text style={styles.emptyText}>Empty</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={trash}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ opacity: 0.6 }}>Trash is empty.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.status} • {item.priority}
              </Text>

              <Text style={styles.time}>
                Deleted: {item.deletedAtPretty || "—"}
              </Text>

              {!!item.description ? (
                <Text style={styles.desc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.photo} />
              ) : null}

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.restoreBtn}
                  onPress={() => restoreIssue?.(item.id)}
                >
                  <Text style={styles.restoreText}>Restore</Text>
                </TouchableOpacity>

                <View style={{ width: 10 }} />

                <TouchableOpacity
                  style={[styles.deleteBtn, !isManager && { opacity: 0.4 }]}
                  onPress={() => confirmPermanentDelete(item.id)}
                  disabled={!isManager}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>

              {!isManager ? (
                <Text style={styles.note}>Only managers can permanently delete.</Text>
              ) : null}
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10, backgroundColor: "#f4f4f6" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: { fontSize: 24, fontWeight: "900" },

  emptyBtn: { backgroundColor: "#B00020", padding: 10, borderRadius: 10 },
  emptyText: { color: "white", fontWeight: "900" },

  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5ea",
    marginBottom: 10,
  },

  cardTitle: { fontSize: 16, fontWeight: "900" },
  meta: { marginTop: 4, fontWeight: "700", opacity: 0.75 },
  time: { fontSize: 12, marginTop: 6, opacity: 0.6, fontWeight: "700" },
  desc: { marginTop: 8, opacity: 0.75, fontWeight: "600" },

  photo: { width: "100%", height: 180, borderRadius: 12, marginTop: 10 },

  row: { flexDirection: "row", marginTop: 12 },

  restoreBtn: { flex: 1, backgroundColor: "black", padding: 12, borderRadius: 10 },
  restoreText: { color: "white", fontWeight: "900", textAlign: "center" },

  deleteBtn: { flex: 1, backgroundColor: "#B00020", padding: 12, borderRadius: 10 },
  deleteText: { color: "white", fontWeight: "900", textAlign: "center" },

  note: { marginTop: 10, opacity: 0.55, fontWeight: "800" },

  backBtn: { marginTop: 10, backgroundColor: "#333", padding: 12, borderRadius: 10 },
  backText: { color: "white", fontWeight: "900", textAlign: "center" },
});