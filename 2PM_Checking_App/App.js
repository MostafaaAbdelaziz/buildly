// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabsNavigator from "./navigation/TabNavigator";

// Issues screens
import CreateIssueScreen from "./screens/CreateIssueScreen";
import IssueDetailScreen from "./screens/IssueDetailScreen";

//Login Screen
import LoginScreen from "./screens/LoginScreen";

// Schedule screens
import CreateScheduleScreen from "./screens/CreateScheduleScreen";
import ScheduleDetailScreen from "./screens/ScheduleDetailScreen";

// Providers
import { IssuesProvider } from "./context/IssuesContext";
import { ScheduleProvider } from "./context/ScheduleContext";
import RegisterScreen from "./screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <IssuesProvider>
      <ScheduleProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            {/* Login screen */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            {/* Main tabs */}
            <Stack.Screen
              name="Tabs"
              component={TabsNavigator}
              options={{ headerShown: false }}
            />

            {/* Issues stack screens */}
            <Stack.Screen
              name="CreateIssue"
              component={CreateIssueScreen}
              options={{ title: "Create Issue" }}
            />
            <Stack.Screen
              name="IssueDetail"
              component={IssueDetailScreen}
              options={{ title: "Issue Detail" }}
            />

            {/* Schedule stack screens */}
            <Stack.Screen
              name="CreateSchedule"
              component={CreateScheduleScreen}
              options={{ title: "Create Schedule" }}
            />
            <Stack.Screen
              name="ScheduleDetail"
              component={ScheduleDetailScreen}
              options={{ title: "Schedule Detail" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ScheduleProvider>
    </IssuesProvider>
  );
}