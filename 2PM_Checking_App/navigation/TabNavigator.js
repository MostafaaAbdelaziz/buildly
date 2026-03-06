import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import PMDashboard from "../screens/PMDashboard";
import IssuesScreen from "../screens/IssuesScreen";
import MapScreen from "../screens/MapScreen";
import DrawingsScreen from "../screens/DrawingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GanttChartScreen from "../screens/GanttChartScreen";
import ForemanDashboard from "../screens/ForemanDashboard";

import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {

  const { role } = useAuth();

  const DashboardComponent = role === "manager" ? PMDashboard : ForemanDashboard;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardComponent} />
      <Tab.Screen name="Issues" component={IssuesScreen} />
      <Tab.Screen name="Schedule" component={GanttChartScreen} />
      <Tab.Screen name="Drawings" component={DrawingsScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}