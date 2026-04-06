import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  Platform,
  ActionSheetIOS,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../constants/theme";
import { useTabBarPadding } from "../hooks/useTabBarPadding";
import { createIssueForSite } from "../services/siteRepository";
import { linkIssueToCheckInAlert, createIssueCreatedNotification } from "../services/notificationRepository";
import { useSiteDetail } from "../hooks/useSiteDetail";
import { useSites } from "../hooks/useSites";
import { uploadIssueImage } from "../services/storageProvider";

export default function CreateIssueScreen({ navigation, route }) {
  const { user } = useAuth();
  const tabBarPadding = useTabBarPadding();
  const siteIdFromRoute = route?.params?.siteId || null;
  const siteNameFromRoute = route?.params?.siteName || "";
  const linkedNotificationId = route?.params?.linkedNotificationId || null;
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const { sites, loading: sitesLoading } = useSites(user?.uid);

  const effectiveSiteId = siteIdFromRoute || selectedSiteId;
  const { site } = useSiteDetail(effectiveSiteId);

  const effectiveSiteName = useMemo(() => {
    if (siteIdFromRoute) {
      return siteNameFromRoute || site?.name || "Site";
    }
    if (selectedSiteId) {
      return sites.find((s) => s.id === selectedSiteId)?.name || site?.name || "Site";
    }
    return site?.name || "";
  }, [siteIdFromRoute, siteNameFromRoute, selectedSiteId, sites, site?.name]);

  useEffect(() => {
    if (siteIdFromRoute) {
      setSelectedSiteId(null);
    }
  }, [siteIdFromRoute]);
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
  
  async function takePhoto() {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required to take a photo.");
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled) {
      setImage(result.assets?.[0]?.uri || null);
    }
  }

  async function pickFromLibrary() {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Photo library permission is required to pick an image.");
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

  function showPhotoOptions() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickFromLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        "Add Photo",
        "Choose an option",
        [
          { text: "Take Photo", onPress: takePhoto },
          { text: "Choose from Library", onPress: pickFromLibrary },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    }
  }

  function openMapPicker() {
    navigation.navigate("Tabs", {
      screen: "Map",
      params: {
        mode: "pick",
        initialLocation: location,
        returnTo: "CreateIssue",
        siteId: effectiveSiteId,
        siteName: effectiveSiteName,
      },
    });
  }

  async function useCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Location permission is required to use your current location.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync();
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  }

  async function handleSave() {
    if (!effectiveSiteId) {
      Alert.alert("Site required", "Please select a site for this issue.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter an issue title.");
      return;
    }

    try{
      let imageUrl = null;
      if (image) {
        const result = await uploadIssueImage(image);
        imageUrl = result.url;
      }

      const ref = await createIssueForSite({
        siteId: effectiveSiteId,
        title: title.trim(),
        priority: priority.trim(),
        description: description.trim(),
        image: imageUrl,
        location: location || null,
        createdBy: user?.displayName || user?.email || "Unknown",
        status: "Open",
      });

      if (linkedNotificationId) {
        linkIssueToCheckInAlert(linkedNotificationId, ref.id).catch((e) =>
          console.warn("Failed to link issue to check-in alert:", e?.message)
        );
      }

      // Notify PM when issue is created by someone other than the PM
      const pmId = site?.projectManagerId;
      if (pmId && pmId !== user?.uid) {
        createIssueCreatedNotification(pmId, {
          siteId: effectiveSiteId,
          siteName: effectiveSiteName,
          issueId: ref.id,
          issueTitle: title.trim(),
          reporterEmail: user?.email ?? "",
        }).catch((e) =>
          console.warn("Failed to send issue-created notification:", e?.message)
        );
      }

      navigation.goBack();

    } catch (e) {
      Alert.alert("Error", e.message || "Could not save issue. Please try again.");
    }
  }

  return (
    <Screen edges={[]} padding={{ paddingHorizontal: 16, paddingTop: 0, paddingBottom: 0 }}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {siteIdFromRoute ? (
          <View style={styles.section}>
            <AppText variant="body" bold style={styles.sectionLabel}>
              Site
            </AppText>
            <Card style={styles.siteFixedCard}>
              <AppText variant="body" bold>
                {siteNameFromRoute || site?.name || "Site"}
              </AppText>
            </Card>
          </View>
        ) : (
          <View style={styles.section}>
            <AppText variant="body" bold style={styles.sectionLabel}>
              Site <AppText style={{ color: colors.accent }}>*</AppText>
            </AppText>
            {sitesLoading ? (
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Loading sites…
              </AppText>
            ) : sites.length === 0 ? (
              <AppText variant="body" style={{ color: colors.textSecondary }}>
                You have no sites yet. Create or join a site first.
              </AppText>
            ) : (
              sites.map((s) => {
                const selected = selectedSiteId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    activeOpacity={0.75}
                    onPress={() => setSelectedSiteId(s.id)}
                  >
                    <Card
                      style={[
                        styles.siteOption,
                        selected && styles.siteOptionSelected,
                      ]}
                    >
                      <AppText variant="body" bold={selected}>
                        {s.name}
                      </AppText>
                    </Card>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        <View style={styles.section}>
          <AppText variant="body" bold style={styles.sectionLabel}>Location <AppText variant="caption" style={{ color: colors.textSecondary }}>(optional)</AppText></AppText>
          
          <Button
            variant="secondary"
            title={
              location
                ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                : "Pick location on map"
            }
            onPress={openMapPicker}
            fullWidth
          />

          <Button
            variant="tertiary"
            tone="positive"
            title="Use current location"
            onPress={useCurrentLocation}
            fullWidth
          />
        </View>

        <View style={styles.section}>
          <AppText variant="body" bold style={styles.sectionLabel}>Title</AppText>
          <TextInput
            testID="issue-title-input"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter issue title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="body" bold style={styles.sectionLabel}>Description</AppText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        <View style={styles.section}>
          <AppText variant="body" bold style={styles.sectionLabel}>Priority</AppText>
          <View style={styles.priorityRow}>
            <Button
              variant={priority === "Low" ? "tertiary" : "secondary"}
              tone="positive"
              title="Low"
              onPress={() => setPriority("Low")}
              style={styles.priorityBtn}
            />
            <Button
              variant={priority === "Medium" ? "tertiary" : "secondary"}
              tone="positive"
              title="Medium"
              onPress={() => setPriority("Medium")}
              style={styles.priorityBtn}
            />
            <Button
              variant={priority === "High" ? "primary" : "secondary"}
              tone="negative"
              title="High"
              onPress={() => setPriority("High")}
              style={styles.priorityBtn}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="body" bold style={styles.sectionLabel}>Photo</AppText>
          {image ? (
            <Card>
              <Image source={{ uri: image }} style={styles.preview} />
              <Button
                variant="secondary"
                title="Change Photo"
                onPress={showPhotoOptions}
                fullWidth
                style={styles.changePhotoBtn}
              />
              <Button
                variant="tertiary"
                tone="negative"
                title="Remove Photo"
                onPress={() => setImage(null)}
                fullWidth
              />
            </Card>
          ) : (
            <Button
              variant="secondary"
              title="Attach Photo"
              onPress={showPhotoOptions}
              fullWidth
            />
          )}
          <AppText variant="caption" style={styles.photoHelper}>
            Photos help document issues clearly
          </AppText>
        </View>

        <Button
          testID="issue-save"
          variant="primary"
          tone="positive"
          title="Save Issue"
          onPress={handleSave}
          fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },

  section: {
    marginTop: 24,
  },
  sectionLabel: {
    marginBottom: 10,
  },
  siteFixedCard: {
    paddingVertical: 12,
  },
  siteOption: {
    marginBottom: 10,
    paddingVertical: 4,
  },
  siteOptionSelected: {
    borderColor: colors.shadow || "#111",
    borderWidth: 2.5,
    backgroundColor: colors.neutral,
  },

  input: {
    borderWidth: 2.5,
    borderColor: colors.neutralBorder,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
  },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    marginBottom: 12,
  },
  changePhotoBtn: {
    marginBottom: 8,
  },
  photoHelper: {
    marginTop: 8,
    textAlign: "center",
  },

  saveBtn: {
    marginTop: 32,
  },
});