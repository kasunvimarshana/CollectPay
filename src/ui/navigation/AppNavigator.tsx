import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {UsersListScreen} from '../screens/UsersListScreen';
import {UserFormScreen} from '../screens/UserFormScreen';

export type RootStackParamList = {
  Users: undefined;
  UserForm: {id?: string} | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Users" component={UsersListScreen} />
      <Stack.Screen name="UserForm" component={UserFormScreen} options={{title: 'User'}} />
    </Stack.Navigator>
  </NavigationContainer>
);
