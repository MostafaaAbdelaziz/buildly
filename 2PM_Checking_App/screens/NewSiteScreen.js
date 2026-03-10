import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import ThemedTextInput from "../components/ThemedTextInput";
import { useAuth } from "../context/AuthContext";
import { buildSitePayload, createSite } from "../services/siteRepository";

export default function NewSiteScreen({ route, navigation }) {
  const siteName = route?.params?.siteName || "New site";
  const { user, role } = useAuth();

  const [addressLine1, setAddressLine1] = useState("");
  const [cityState, setCityState] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const trimmedName = (siteName || "").trim();
    if (!trimmedName) {
      Alert.alert("Missing site name", "Enter a name for this site before continuing.");
      return;
    }
    if (!user?.uid) {
      Alert.alert("Not signed in", "You must be signed in as a project manager to create a site.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildSitePayload({
        name: trimmedName,
        projectManagerId: user.uid,
        addressLine1,
        cityState,
        description,
      });
      const ref = await createSite(payload);
      navigation.replace("SiteDetail", { siteId: ref.id });
    } catch (e) {
      console.log("NewSiteScreen create error:", e?.message);
      Alert.alert("Could not create site", "Something went wrong saving this site. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <AppText variant="title" bold style={styles.title}>
            {siteName}
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            Set up this project so the team can track work, issues, and schedules here.
          </AppText>
        </View>

        <View style={styles.body}>
          <AppText variant="body" bold style={styles.sectionLabel}>
            Site details
          </AppText>
          <AppText variant="caption" style={styles.sectionCaption}>
            You can fill in more later. For now, just give us the basics for this site.
          </AppText>

          <ThemedTextInput
            label="Address line 1"
            placeholder="123 Main Street"
            value={addressLine1}
            onChangeText={setAddressLine1}
            style={styles.field}
          />

          <ThemedTextInput
            label="City, state"
            placeholder="City, ST"
            value={cityState}
            onChangeText={setCityState}
            style={styles.field}
          />

          <ThemedTextInput
            label="Short description"
            placeholder="Optional: how the team refers to this site"
            value={description}
            onChangeText={setDescription}
            style={styles.field}
            multiline
          />

          <View style={styles.actions}>
            <Button
              title={saving ? "Creating..." : "Create site"}
              onPress={handleCreate}
              disabled={saving}
              fullWidth
            />
            <Button
              title="Back to dashboard"
              variant="secondary"
              onPress={() => navigation.navigate("Tabs")}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  headerBlock: {
    marginBottom: 16,
  },
  title: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.9,
  },
  body: {
    flex: 1,
  },
  sectionLabel: {
    marginBottom: 4,
  },
  sectionCaption: {
    marginBottom: 12,
  },
  field: {
    marginTop: 4,
  },
  actions: {
    marginTop: 24,
    gap: 8,
  },
});

