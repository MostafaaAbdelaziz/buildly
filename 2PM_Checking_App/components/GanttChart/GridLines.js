import React from "react";
import { View } from "react-native";
import { styles } from "./styles";

export function GridLines({ totalDays, totalHeight, viewMode, dayWidth }) {
  if (viewMode === "Day") {
    return Array.from({ length: totalDays }).map((_, i) => (
      <View
        key={i}
        style={[styles.gridLine, { left: i * dayWidth, height: totalHeight }]}
      />
    ));
  }
  if (viewMode === "Week") {
    const lines = [];
    for (let i = 0; i < totalDays; i += 7) {
      lines.push(
        <View key={i} style={[styles.gridLine, { left: i * dayWidth, height: totalHeight }]} />
      );
    }
    return lines;
  }
  return null;
}
