import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useSchedule } from "../context/ScheduleContext";

export default function CreateScheduleScreen({ navigation }) {
  const { addItem } = useSchedule();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");         // YYYY-MM-DD
  const [startTime, setStartTime] = useState(""); // HH:MM
  const [endTime, setEndTime] = useState("");     // HH:MM
  const [location, setLocation] = useState("");
  const [crew, setCrew] = useState("BL");
  const [notes, setNotes] = useState("");

  function handleSave() {
    if (!title.trim()) return;
    if (!date.trim()) return;

    addItem({
      title: title.trim(),
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      location: location.trim(),
      notes: notes.trim(),
      crew: crew.trim(),
    });

    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Schedule</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Foundation Work" />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="e.g., 2026-02-19" />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Start (HH:MM)</Text>
          <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="e.g., 08:00" />
        </View>

        <View style={{ width: 10 }} />

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>End (HH:MM)</Text>
          <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="e.g., 11:30" />
        </View>
      </View>

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g., Site A - North entrance" />

      <Text style={styles.label}>Crew (initials)</Text>
      <TextInput style={styles.input} value={crew} onChangeText={setCrew} placeholder="e.g., BL / LT / DJ" />

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
  row: { flexDirection: "row", alignItems: "center" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "white",
  },
  textArea: { height: 110, textAlignVertical: "top" },

  btn: { marginTop: 18, backgroundColor: "black", padding: 14, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "800", textAlign: "center" },
});