import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import SiteTaskRow from "./SiteTaskRow";
import AppText from "./AppText";

export default function SiteTaskList({ data }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <AppText variant="caption">No site tasks to show.</AppText>
      </View>
    );
  }
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SiteTaskRow
          siteName={item.siteName}
          taskName={item.taskName}
          days={item.days}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 80,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
