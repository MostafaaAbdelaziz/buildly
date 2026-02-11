import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useIssues } from "../context/IssuesContext";

export default function IssuesScreen({ navigation }) {
  const { issues } = useIssues();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Issues</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("CreateIssue")}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ opacity: 0.6 }}>No issues yet. Add one.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("IssueDetail", { issue: item })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.status} • {item.priority}</Text>
            <Text style={styles.time}>{item.createdAt}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800" },
  addBtn: { backgroundColor: "black", padding: 10, borderRadius: 10 },
  addText: { color: "white", fontWeight: "700" },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#ddd", marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  meta: { marginTop: 4 },
  time: { fontSize: 12, marginTop: 4, opacity: 0.6 },
});