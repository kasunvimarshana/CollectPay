import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../../application/state/AuthContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Suppliers', icon: '👥', screen: 'Suppliers' as const },
    { title: 'Products', icon: '📦', screen: 'Products' as const },
    { title: 'Collections', icon: '📊', screen: 'Collections' as const },
    { title: 'Payments', icon: '💰', screen: 'Payments' as const },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
