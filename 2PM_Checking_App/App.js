import React, { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { NavigationContainer } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabsNavigator from "./navigation/TabNavigator";

import CreateIssueScreen from "./screens/CreateIssueScreen";
import IssueDetailScreen from "./screens/IssueDetailScreen";
import InviteMemberScreen from "./screens/InviteMemberScreen";

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
import SiteDailyCheckInScreen from "./screens/SiteDailyCheckInScreen";
import DrawingDetailScreen from "./screens/DrawingDetailScreen";
import DrawingsScreen from "./screens/DrawingsScreen";
import IssuesScreen from "./screens/IssuesScreen";
import SiteCheckInSettingsScreen from "./screens/SiteCheckInSettingsScreen";

// Show notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

export default function App() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.siteId && navigationRef.isReady()) {
        navigationRef.navigate("2PMCheck", {
          siteId: data.siteId,
          siteName: data.siteName ?? "",
        });
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <AuthProvider>
      <IssuesProvider>
        <ScheduleProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />

              <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />

              <Stack.Screen name="CreateIssue" component={CreateIssueScreen} options={{ title: "Create Issue" }} />
              <Stack.Screen name="IssueDetail" component={IssueDetailScreen} options={{ title: "Issue Detail" }} />
              <Stack.Screen name="InviteMember" component={InviteMemberScreen} options={{ title: "Invite Member" }} />
              <Stack.Screen name="Trash" component={TrashScreen} options={{ title: "Trash" }} />

              <Stack.Screen name="CreateSchedule" component={CreateScheduleScreen} options={{ title: "Create Schedule" }} />
              <Stack.Screen name="ScheduleDetail" component={ScheduleDetailScreen} options={{ title: "Schedule Detail" }} />
              <Stack.Screen name="SiteSchedules" component={SiteSchedulesScreen} options={{ title: "Schedules" }} />
              <Stack.Screen name="2PMCheck" component={TwoPMCheckScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SiteDailyCheckIn" component={SiteDailyCheckInScreen} options={{ headerShown: false }} />
              <Stack.Screen name="DrawingDetail" component={DrawingDetailScreen} options={{ title: "Drawing Detail" }} />
              <Stack.Screen name="SiteDrawings" component={DrawingsScreen} options={{ title: "Drawings" }} />
              <Stack.Screen name="Issues" component={IssuesScreen} options={{ title: "Issues" }} />
              <Stack.Screen name="SiteCheckInSettings" component={SiteCheckInSettingsScreen} options={{ title: "Check-in Settings" }} />
            </Stack.Navigator>
          </NavigationContainer>
        </ScheduleProvider>
      </IssuesProvider>
    </AuthProvider>
  );
}