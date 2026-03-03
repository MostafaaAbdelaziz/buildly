import React from "react";
import { View, StyleSheet } from "react-native";
import Card from "./Card";
import AppText from "./AppText";

export default function SiteTaskRow({ siteName, taskName, days }) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.left}>
          <AppText variant="body" bold>{siteName}</AppText>
          <AppText variant="caption">{taskName}</AppText>
        </View>
        <AppText variant="body">{days} days</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flex: 1,
  },
});
