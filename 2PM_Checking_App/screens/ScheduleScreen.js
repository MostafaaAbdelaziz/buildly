import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useSchedule } from "../context/ScheduleContext";

export default function ScheduleScreen({ navigation }) {
  const { items } = useSchedule();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Schedule</Text>

        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("CreateSchedule")}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ opacity: 0.6 }}>No schedule items yet. Add one.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.status === "Done" && styles.cardDone]}
            onPress={() => navigation.navigate("ScheduleDetail", { item })}
          >
            <Text style={[styles.cardTitle, item.status === "Done" && styles.textDone]}>
              {item.title}
            </Text>

            <Text style={[styles.meta, item.status === "Done" && styles.textDone]}>
              {(item.date || "No date")} • {(item.time || "No time")} • {item.status}
            </Text>

            {!!item.location && (
              <Text style={[styles.small, item.status === "Done" && styles.textDone]}>
                📍 {item.location}
              </Text>
            )}
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
  cardDone: { opacity: 0.7 },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  meta: { marginTop: 6 },
  small: { marginTop: 6, opacity: 0.8 },
  textDone: { textDecorationLine: "line-through", opacity: 0.7 },
});