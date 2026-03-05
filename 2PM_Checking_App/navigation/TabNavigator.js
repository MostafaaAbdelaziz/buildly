import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DashboardScreen from "../screens/DashboardScreen";
import IssuesScreen from "../screens/IssuesScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import MapScreen from "../screens/MapScreen";
import DrawingsScreen from "../screens/DrawingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TrashScreen from "../screens/TrashScreen";
import GanttChartScreen from "../screens/GanttChartScreen";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Issues" component={IssuesScreen} />
      <Tab.Screen name="Schedule" component={GanttChartScreen} />
      <Tab.Screen name="Drawings" component={DrawingsScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Trash" component={TrashScreen} />
    </Tab.Navigator>
  );
}