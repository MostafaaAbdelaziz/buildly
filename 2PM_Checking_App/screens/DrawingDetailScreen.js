import React from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from "react-native";
import Screen from "../components/Screen";
import { useRoute } from "@react-navigation/native";
import { useDrawingDetail } from "../hooks/useDrawingDetail";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

export default function DrawingDetailScreen() {
  const route = useRoute();
  const { siteId, drawingId } = route.params || {};
  const { drawing, loading, error } = useDrawingDetail(siteId, drawingId);
  const tabBarPadding = useTabBarPadding();

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: tabBarPadding }]}>
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text style={styles.errorText}>{error.message || "Failed to load drawing."}</Text>
        ) : !drawing ? (
          <Text style={styles.errorText}>Drawing not found.</Text>
        ) : (
          <>
            <Text style={styles.title}>{drawing.title || "Drawing"}</Text>
            <Text style={styles.meta}>
              v{drawing.version || 1} · Provider: {drawing.provider || "unknown"}
            </Text>

            {drawing.fileUrl ? (
              <Image source={{ uri: drawing.fileUrl }} style={styles.image} />
            ) : (
              <Text style={styles.errorText}>No image URL available.</Text>
            )}

            {drawing.description ? <Text style={styles.description}>{drawing.description}</Text> : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  meta: {
    color: "#6B7280",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#E5E7EB",
  },
  description: {
    fontSize: 14,
    color: "#111827",
  },
  errorText: {
    color: "#DC2626",
  },
});

