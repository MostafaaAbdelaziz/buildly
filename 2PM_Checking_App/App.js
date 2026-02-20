import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabsNavigator from "./navigation/TabNavigator";

import CreateIssueScreen from "./screens/CreateIssueScreen";
import IssueDetailScreen from "./screens/IssueDetailScreen";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

import CreateScheduleScreen from "./screens/CreateScheduleScreen";
import ScheduleDetailScreen from "./screens/ScheduleDetailScreen";

import { IssuesProvider } from "./context/IssuesContext";
import { ScheduleProvider } from "./context/ScheduleContext";
import { AuthProvider } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <IssuesProvider>
        <ScheduleProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />

              <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />

              <Stack.Screen name="CreateIssue" component={CreateIssueScreen} options={{ title: "Create Issue" }} />
              <Stack.Screen name="IssueDetail" component={IssueDetailScreen} options={{ title: "Issue Detail" }} />

              <Stack.Screen name="CreateSchedule" component={CreateScheduleScreen} options={{ title: "Create Schedule" }} />
              <Stack.Screen name="ScheduleDetail" component={ScheduleDetailScreen} options={{ title: "Schedule Detail" }} />
            </Stack.Navigator>
          </NavigationContainer>
        </ScheduleProvider>
      </IssuesProvider>
    </AuthProvider>
  );
}