import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  AddCollectionScreen,
  AddPaymentScreen,
  ConflictsScreen,
  LoginScreen,
  SupplierScreen,
  SuppliersScreen,
} from "../screens";

import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(props: { isAuthed: boolean; onSignedOut: () => void }) {
  return (
    <Stack.Navigator>
      {!props.isAuthed ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Suppliers"
            component={SuppliersScreen}
            options={{ title: "Suppliers" }}
          />
          <Stack.Screen
            name="Conflicts"
            component={ConflictsScreen}
            options={{ title: "Conflicts" }}
          />
          <Stack.Screen
            name="Supplier"
            component={SupplierScreen}
            options={{ title: "Supplier" }}
          />
          <Stack.Screen
            name="AddCollection"
            component={AddCollectionScreen}
            options={{ title: "Add Collection" }}
          />
          <Stack.Screen
            name="AddPayment"
            component={AddPaymentScreen}
            options={{ title: "Add Payment" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
