import "react-native-get-random-values";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { AppNavigator } from "./src/nav/AppNavigator";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";

function Root() {
  const { loading, isAuthed } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <AppNavigator isAuthed={isAuthed} onSignedOut={() => {}} />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Root />
      </NavigationContainer>
    </AuthProvider>
  );
}
