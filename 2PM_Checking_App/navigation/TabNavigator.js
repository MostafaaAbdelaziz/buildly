import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DashboardStack from "./DashboardStack";
import IssuesScreen from "../screens/IssuesScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GanttChartScreen from "../screens/GanttChartScreen";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Issues" component={IssuesScreen} />
      <Tab.Screen name="Schedule" component={GanttChartScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}