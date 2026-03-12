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
import SiteSchedulesScreen from "./screens/SiteSchedulesScreen";

import { IssuesProvider } from "./context/IssuesContext";
import { ScheduleProvider } from "./context/ScheduleContext";
import { AuthProvider } from "./context/AuthContext";
import TrashScreen from "./screens/TrashScreen";
import TwoPMCheckScreen from "./screens/TwoPMCheckScreen";
import DrawingDetailScreen from "./screens/DrawingDetailScreen";

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
              <Stack.Screen name="Trash" component={TrashScreen} options={{ title: "Trash" }} />

              <Stack.Screen name="CreateSchedule" component={CreateScheduleScreen} options={{ title: "Create Schedule" }} />
              <Stack.Screen name="ScheduleDetail" component={ScheduleDetailScreen} options={{ title: "Schedule Detail" }} />
              <Stack.Screen name="SiteSchedules" component={SiteSchedulesScreen} options={{ title: "Schedules" }} />
              <Stack.Screen name="2PMCheck" component={TwoPMCheckScreen} options={{ title: "2PM Check" }} />
              <Stack.Screen name="DrawingDetail" component={DrawingDetailScreen} options={{ title: "Drawing Detail" }} />
            </Stack.Navigator>
          </NavigationContainer>
        </ScheduleProvider>
      </IssuesProvider>
    </AuthProvider>
  );
}