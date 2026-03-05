import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { useIssues } from "../context/IssuesContext";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";

export default function CreateIssueScreen({ navigation, route }) {
  const { addIssue } = useIssues();
  const { user } = useAuth();


  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null); // { latitude, longitude }

  useEffect(() => {
    const picked = route?.params?.pickedLocation;
    if (picked) {
      setLocation(picked);

      // clear so it doesn't keep reusing it
      navigation.setParams({ pickedLocation: undefined });
    }
  }, [route?.params?.pickedLocation]);
  
  async function pickImage() {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission needed to access your photos.");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled) {
      setImage(result.assets?.[0]?.uri || null);
    }
  }

  function openMapPicker() {
    navigation.navigate("Tabs", {
      screen: "Map",
      params: {
        mode: "pick",
        initialLocation: location,
        returnTo: "CreateIssue",
      },
    });
  }

  async function useCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission needed to access your location.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync();
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  }

  function handleSave() {
  if (!title.trim()) return;

  if (!location) {
    alert("Please pick a location on the map before saving.");
    return;
  }

console.log("user.email", user?.email);
console.log("user.displayName", user?.displayName);

  addIssue({
    title: title.trim(),
    priority: priority.trim(), // Low/Medium/High
    description: description.trim(),
    image: image || null,
    location, // ✅ required now
    createdBy: user?.displayName || "Unknown",
  });

  navigation.goBack();
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Issue</Text>
 
      <Text style={styles.label}>Location</Text>
      <TouchableOpacity style={styles.outlineBtn} onPress={openMapPicker}>
      
        <Text style={styles.outlineBtnText}>
          {location
            ? `Picked: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
            : "Pick location on map"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.currentLocationBtn, { marginTop: 10 }]} onPress={useCurrentLocation}>
        <Text style={styles.currentLocationText}>Use current location</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter issue title"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the issue..."
        multiline
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {["Low", "Medium", "High"].map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.priorityBtn, priority === p && styles.priorityBtnActive]}
            onPress={() => setPriority(p)}
          >
            <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

     

      <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={pickImage}>
        <Text style={styles.btnText}>{image ? "Change Photo" : "Attach Photo"}</Text>
      </TouchableOpacity>

      {image ? <Image source={{ uri: image }} style={styles.preview} /> : null}

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Save Issue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  label: { fontWeight: "700", marginBottom: 6, marginTop: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
  },

  priorityRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  priorityBtnActive: { backgroundColor: "black", borderColor: "black" },
  priorityText: { fontWeight: "700" },
  priorityTextActive: { color: "white" },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "white",
  },
  outlineBtnText: { fontWeight: "800", textAlign: "center" },

  btn: { marginTop: 18, backgroundColor: "black", padding: 14, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "800", textAlign: "center" },

  preview: { width: "100%", height: 220, marginTop: 10, borderRadius: 12 },

  currentLocationBtn: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  currentLocationText: { fontWeight: "700", textAlign: "center" },
});