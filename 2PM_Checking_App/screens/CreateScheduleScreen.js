import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useSchedule } from "../context/ScheduleContext";

export default function CreateScheduleScreen({ navigation }) {
  const { addItem } = useSchedule();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");       // YYYY-MM-DD
  const [time, setTime] = useState("");       // HH:MM
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  function handleSave() {
    if (!title.trim()) return;

    addItem({
      title: title.trim(),
      date,
      time,
      location,
      notes,
    });

    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Schedule</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Site walk-through" />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="e.g., 2026-02-19" />

      <Text style={styles.label}>Time (HH:MM)</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="e.g., 14:00" />

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g., Site A - North entrance" />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Extra info..."
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Save Schedule</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  label: { fontWeight: "700", marginBottom: 6, marginTop: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
  },
  textArea: { height: 110, textAlignVertical: "top" },

  btn: { marginTop: 18, backgroundColor: "black", padding: 14, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "800", textAlign: "center" },
});