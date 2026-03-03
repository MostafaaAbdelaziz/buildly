import React from "react";
import { View, Text } from "react-native";
import { DASH_SIZE, DASH_GAP } from "./constants";
import { styles } from "./styles";

export function TodayLine({ height }) {
  const count = Math.ceil(height / (DASH_SIZE + DASH_GAP));
  return (
    <View style={styles.dashedLineWrap}>
      <Text style={styles.todayLabel}>Today</Text>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.dash} />
      ))}
    </View>
  );
}
