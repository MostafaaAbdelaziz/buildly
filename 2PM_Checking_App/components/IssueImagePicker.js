import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Platform, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";

export async function pickFromLibrary() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Photo library permission is required to pick an image.");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.8,
  });
  if (!result.canceled) {
    return result.assets?.[0]?.uri || null;
  }
}

export default function IssueImagePicker({ value, onChange }) {
  const [error, setError] = useState("");
  const { role } = useAuth();
  const isManager = role == "manager";

  async function requestCameraPermission() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError("Camera permission is required to take a photo.");
      return false;
    }
    return true;
  }

  async function requestMediaPermission() {
    // For iOS/Android this matters. Web usually doesn't need it.
    if (Platform.OS === "web") return true;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Photo library permission is required to pick an image.");
      return false;
    }
    return true;
  }

  async function handlePickFromLibrary() {
    try{
      setError("");
      const uri = await pickFromLibrary();
      if (uri) {
        onChange?.(uri);
      }
    } catch (err) {
      setError("An error occurred while picking the image.");
    }
  }

  async function takePhoto() {
    setError("");

    // Camera is best on iOS/Android.
    // On web, many browsers won’t support it well, so we fallback to library.
    if (Platform.OS === "web") {
      await pickFromLibrary();
      return;
    }

    const ok = await requestCameraPermission();
    if (!ok) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      onChange?.(uri);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Image</Text>

      {isManager &&(
        <>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={takePhoto}>
            <Text style={styles.btnText}>Use Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handlePickFromLibrary}>
            <Text style={styles.btnText}>Pick Image</Text>
          </TouchableOpacity>
        </View>
      
          {value ? (
            <Image source={{ uri: value }} style={styles.preview} />
          ) : (
            <Text style={styles.helper}>No image selected yet.</Text>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          </>
        )}
        </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 16 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  btn: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  danger: { backgroundColor: "#991B1B" },
  btnText: { color: "white", fontWeight: "600" },
  preview: { width: "100%", height: 220, borderRadius: 14, marginTop: 12 },
  helper: { color: "#6B7280", marginTop: 10 },
  error: { color: "#DC2626", marginTop: 10, fontWeight: "600" },
});