import React from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getRoleConfig } from "../constants/roleConfig";
import Screen from "../components/Screen";
import DashboardHeader from "../components/DashboardHeader";
import SiteTaskList from "../components/SiteTaskList";
import DashboardFAB from "../components/DashboardFAB";

const MOCK_SITE_TASKS = [
  { id: "1", siteName: "Site A", taskName: "Task X", days: 3 },
  { id: "2", siteName: "Site B", taskName: "Task Y", days: 5 },
  { id: "3", siteName: "Site C", taskName: "Task Z", days: 7 },
];

export default function DashboardScreen({ navigation }) {
  const { role } = useAuth();
  const roleConfig = getRoleConfig(role);
  const headerLabel = roleConfig.homeHeaderLabel || roleConfig.homeTitle || "HOME";

  return (
    <Screen>
      <DashboardHeader title={headerLabel} />
      <View style={styles.listContainer}>
        <SiteTaskList data={MOCK_SITE_TASKS} />
      </View>
      <DashboardFAB navigation={navigation} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
});
