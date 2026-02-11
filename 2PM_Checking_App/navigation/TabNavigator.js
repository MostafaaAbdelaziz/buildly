import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "../screens/DashboardScreen";
import IssuesScreen from "../screens/IssuesScreen";
import IssueDetailScreen from "../screens/IssueDetailScreen";
import CreateIssueScreen from "../screens/CreateIssueScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function IssuesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="IssuesHome" component={IssuesScreen} options={{ title: "Issues" }} />
      <Stack.Screen name="IssueDetail" component={IssueDetailScreen} />
      <Stack.Screen name="CreateIssue" component={CreateIssueScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Issues" component={IssuesStack} options={{ headerShown: false }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}