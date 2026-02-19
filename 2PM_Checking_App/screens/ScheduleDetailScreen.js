import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSchedule } from "../context/ScheduleContext";

export default function ScheduleDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { items, toggleDone, deleteItem } = useSchedule();

  const current = useMemo(() => {
    return items.find((x) => x.id === item.id) || item;
  }, [items, item]);

  function handleDelete() {
    Alert.alert("Delete", "Delete this schedule item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteItem(current.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{current.title}</Text>

      <View style={styles.block}>
        <Text style={styles.line}>Date: {current.date || "—"}</Text>
        <Text style={styles.line}>Time: {current.time || "—"}</Text>
        <Text style={styles.line}>Status: {current.status}</Text>
        {!!current.location && <Text style={styles.line}>Location: {current.location}</Text>}

        <Text style={[styles.line, { marginTop: 10, fontWeight: "800" }]}>Notes</Text>
        <Text style={{ opacity: 0.9 }}>{current.notes || "No notes."}</Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => toggleDone(current.id)}>
        <Text style={styles.btnText}>{current.status === "Done" ? "Mark Planned" : "Mark Done"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.danger]} onPress={handleDelete}>
        <Text style={styles.btnText}>Delete</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Schedule</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },

  block: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12 },
  line: { marginBottom: 6 },

  btn: { marginTop: 14, backgroundColor: "black", padding: 14, borderRadius: 12 },
  danger: { backgroundColor: "#B00020" },
  btnText: { color: "white", fontWeight: "800", textAlign: "center" },

  backBtn: { marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: "#333" },
  backText: { color: "white", fontWeight: "700", textAlign: "center" },
});