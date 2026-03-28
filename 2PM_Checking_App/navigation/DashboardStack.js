import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PMDashboard from "../screens/PMDashboard";
import ForemanDashboard from "../screens/ForemanDashboard";
import SiteDetailScreen from "../screens/SiteDetailScreen";
import NewSiteScreen from "../screens/NewSiteScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
  const { role } = useAuth();
  const DashboardComponent = role === "manager" ? PMDashboard : ForemanDashboard;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardHome"
        component={DashboardComponent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewSite"
        component={NewSiteScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SiteDetail"
        component={SiteDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
