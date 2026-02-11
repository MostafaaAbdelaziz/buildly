import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./navigation/TabNavigator";
import { IssuesProvider } from "./context/IssuesContext";

export default function App() {
  return (
    <IssuesProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </IssuesProvider>
  );
}