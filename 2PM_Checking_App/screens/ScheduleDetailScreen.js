import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";

export default function ScheduleDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { items, toggleDone, deleteItem } = useSchedule();
  const { role } = useAuth();

  const isManager = role === "manager";

  const current = useMemo(() => {
    return items.find((x) => x.id === item.id) || item;
  }, [items, item]);

  const timeText = `${current.startTime || "—"} - ${current.endTime || "—"}`;

  async function handleToggle() {
    if (!isManager) {
      Alert.alert("Access denied", "Only managers can update schedule items.");
      return;
    }

    try {
      await toggleDone(current.id);
    } catch (e) {
      console.log(e?.message);
      Alert.alert("Error", e?.message || "Failed to update status.");
    }
  }

  function handleDelete() {
    if (!isManager) {
      Alert.alert("Access denied", "Only managers can delete schedule items.");
      return;
    }

    Alert.alert("Delete", "Delete this schedule item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteItem(current.id);
            navigation.goBack();
          } catch (e) {
            console.log(e?.message);
            Alert.alert("Error", e?.message || "Failed to delete item.");
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{current.title}</Text>

      <View style={styles.block}>
        <Text style={styles.line}>Date: {current.date || "—"}</Text>
        <Text style={styles.line}>Time: {timeText}</Text>
        <Text style={styles.line}>Status: {current.status || "—"}</Text>

        {!!current.crew && <Text style={styles.line}>Crew: {current.crew}</Text>}
        {!!current.location && <Text style={styles.line}>Location: {current.location}</Text>}

        <Text style={[styles.line, styles.notesLabel]}>Notes</Text>
        <Text style={styles.notesText}>{current.notes || "No notes."}</Text>

        {!isManager && (
          <Text style={styles.viewOnly}>
            Foreman view: you can view details but only managers can edit or delete.
          </Text>
        )}
      </View>

      {isManager && (
        <>
          <TouchableOpacity style={styles.btn} onPress={handleToggle}>
            <Text style={styles.btnText}>
              {current.status === "Done" ? "Mark Planned" : "Mark Done"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.danger]} onPress={handleDelete}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Schedule</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f4f6" },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 12 },

  block: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e5ea",
    borderRadius: 14,
    padding: 14,
  },

  line: { marginBottom: 8, fontWeight: "700", opacity: 0.75 },
  notesLabel: { marginTop: 10, fontWeight: "900", opacity: 0.7 },
  notesText: { fontWeight: "700", opacity: 0.7 },

  viewOnly: { marginTop: 14, fontWeight: "800", opacity: 0.5 },

  btn: { marginTop: 14, backgroundColor: "black", padding: 14, borderRadius: 12 },
  danger: { backgroundColor: "#B00020" },
  btnText: { color: "white", fontWeight: "900", textAlign: "center" },

  backBtn: { marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: "#333" },
  backText: { color: "white", fontWeight: "800", textAlign: "center" },
});