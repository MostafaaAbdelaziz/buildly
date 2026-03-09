import React from "react";
import { View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";

export default function NewSiteScreen({ route, navigation }) {
  const siteName = route?.params?.siteName || "New site";

  return (
    <Screen>
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
          Project details (placeholder)
        </AppText>
        <AppText variant="caption">
          Later this screen will collect site address, start date, and key contacts. For now it
          just confirms the site name you chose.
        </AppText>

        <View style={styles.actions}>
          <Button
            title="Back to dashboard"
            variant="secondary"
            onPress={() => navigation.navigate("Tabs")}
            fullWidth
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  actions: {
    marginTop: 24,
  },
});

