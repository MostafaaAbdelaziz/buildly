import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import GanttChart from "../components/GanttChart/GanttChart";
import { layout } from "../constants/theme";

export default function GanttChartScreen() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = layout.floatingTabBarHeight + insets.bottom;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.screen, { paddingBottom: tabBarSpace }]}>
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

