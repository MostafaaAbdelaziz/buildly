import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GanttChart from "../components/GanttChart/GanttChart";

export default function GanttChartScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <GanttChart />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f6",
  },
  screen: {
    flex: 1,
    backgroundColor: "#f4f4f6",
  },
});

