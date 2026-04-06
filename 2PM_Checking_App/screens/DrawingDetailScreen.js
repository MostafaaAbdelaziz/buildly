import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, useWindowDimensions } from "react-native";
import Screen from "../components/Screen";
import { useRoute } from "@react-navigation/native";
import { useDrawingDetail } from "../hooks/useDrawingDetail";
import { useTabBarPadding } from "../hooks/useTabBarPadding";
import ImageModal from "react-native-image-modal";

export default function DrawingDetailScreen() {
  const route = useRoute();
  const { siteId, drawingId } = route.params || {};
  const { drawing, loading, error } = useDrawingDetail(siteId, drawingId);
  const tabBarPadding = useTabBarPadding();

  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!drawing?.fileUrl) return;

    Image.getSize(
      drawing.fileUrl,
      (width, height) => setImageSize({ width, height }),
      () => setImageSize({ width: 0, height: 0 })
    );
  }, [drawing?.fileUrl]);

  const horizontalPadding = 16;
  const availableWidth = screenWidth - horizontalPadding * 2;

  const aspectRatio = imageSize.width > 0 && imageSize.height > 0 ?
  imageSize.width / imageSize.height : 1;

  const calculatedHeight = availableWidth / aspectRatio;
  const maxHeight = screenHeight * 0.75;

  if(calculatedHeight > maxHeight) {
    calculatedHeight = maxHeight;
  }
  
  return (
    <Screen>
      <View contentContainerStyle={[styles.container, { paddingBottom: tabBarPadding }]}>
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text style={styles.errorText}>{error.message || "Failed to load drawing."}</Text>
        ) : !drawing ? (
          <Text style={styles.errorText}>Drawing not found.</Text>
        ) : (
          <>
            <Text style={styles.title}>{drawing.title || "Drawing"}</Text>

            {drawing.fileUrl ? (
              <ImageModal
                resizeMode="contain"
                imageBackgroundColor="#000"
                modalImageResizeMode="contain"
                style={[styles.image, { width: availableWidth, height: calculatedHeight }]}
                source={{ uri: drawing.fileUrl }}
              />
            ) : (
              <Text style={styles.errorText}>No image URL available.</Text>
            )}
          </>
        )}
      </View>
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

