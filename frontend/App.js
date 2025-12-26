// Main App entry point
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  AppState,
} from "react-native";

// Infrastructure
import Database from "./src/infrastructure/database/Database";
import NetworkMonitor from "./src/infrastructure/network/NetworkMonitor";
import SyncEngine from "./src/infrastructure/sync/SyncEngine";
import SecureStorage from "./src/infrastructure/storage/SecureStorage";

// Context Providers
import { AuthProvider, SyncProvider, AppProvider } from "./src/context";

// Screens
import LoginScreen from "./src/presentation/screens/LoginScreen";
import HomeScreen from "./src/presentation/screens/HomeScreen";
import SuppliersScreen from "./src/presentation/screens/SuppliersScreen";
import CollectionsScreen from "./src/presentation/screens/CollectionsScreen";
import PaymentsScreen from "./src/presentation/screens/PaymentsScreen";
import ProductsScreen from "./src/presentation/screens/ProductsScreen";
import RatesScreen from "./src/presentation/screens/RatesScreen";
import SupplierDetailScreen from "./src/presentation/screens/SupplierDetailScreen";
import AddCollectionScreen from "./src/presentation/screens/AddCollectionScreen";
import AddPaymentScreen from "./src/presentation/screens/AddPaymentScreen";

const Stack = createNativeStackNavigator();

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      NetworkMonitor.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await Database.init();
      console.log("Database initialized");

      // Initialize network monitoring
      NetworkMonitor.init();
      console.log("Network monitor initialized");

      // Initialize sync engine
      await SyncEngine.init();
      console.log("Sync engine initialized");

      // Check authentication
      const token = await SecureStorage.getAuthToken();
      setIsAuthenticated(!!token);

      // Setup sync listeners
      SyncEngine.on("syncStarted", () => {
        console.log("Sync started");
      });

      SyncEngine.on("syncCompleted", (result) => {
        console.log("Sync completed:", result);
      });

      SyncEngine.on("syncFailed", (error) => {
        console.error("Sync failed:", error);
      });

      setIsLoading(false);
    } catch (error) {
      console.error("App initialization error:", error);
      setIsLoading(false);
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active" && isAuthenticated) {
      // App came to foreground - trigger sync
      SyncEngine.triggerSync("app_foreground");
    }
  };

  const handleLogin = async (token, userData) => {
    await SecureStorage.setAuthToken(token);
    await SecureStorage.setUserData(userData);
    setIsAuthenticated(true);

    // Trigger initial sync after login
    SyncEngine.triggerSync("login");
  };

  const handleLogout = async () => {
    await SecureStorage.clearAuth();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing SyncLedger...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home" options={{ title: "SyncLedger" }}>
              {(props) => <HomeScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Suppliers"
              component={SuppliersScreen}
              options={{ title: "Suppliers" }}
            />
            <Stack.Screen
              name="SupplierDetail"
              component={SupplierDetailScreen}
              options={{ title: "Supplier Details" }}
            />
            <Stack.Screen
              name="Collections"
              component={CollectionsScreen}
              options={{ title: "Collections" }}
            />
            <Stack.Screen
              name="AddCollection"
              component={AddCollectionScreen}
              options={{ title: "Add Collection" }}
            />
            <Stack.Screen
              name="Payments"
              component={PaymentsScreen}
              options={{ title: "Payments" }}
            />
            <Stack.Screen
              name="AddPayment"
              component={AddPaymentScreen}
              options={{ title: "Add Payment" }}
            />
            <Stack.Screen
              name="Products"
              component={ProductsScreen}
              options={{ title: "Products" }}
            />
            <Stack.Screen
              name="Rates"
              component={RatesScreen}
              options={{ title: "Rates" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Main App wrapper with context providers
export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <SyncProvider>
          <AppContent />
        </SyncProvider>
      </AuthProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
