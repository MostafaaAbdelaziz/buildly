import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DashboardStack from "./DashboardStack";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GanttChartScreen from "../screens/GanttChartScreen";
import FloatingTabBar from "../components/FloatingTabBar";
import {
  DashboardIcon,
  ScheduleIcon,
  MapIcon,
  ProfileIcon,
} from "../components/TabIcons";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color }) => <DashboardIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={GanttChartScreen}
        options={{
          tabBarIcon: ({ color }) => <ScheduleIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => <MapIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}