import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PayTrack</Text>
      <Text style={styles.subtitle}>Data Collection & Payment Management</Text>
      
      <View style={styles.menuContainer}>
        <Link href="/suppliers" style={styles.menuItem}>
          <Text style={styles.menuText}>Suppliers</Text>
        </Link>
        
        <Link href="/products" style={styles.menuItem}>
          <Text style={styles.menuText}>Products</Text>
        </Link>
        
        <Link href="/collections" style={styles.menuItem}>
          <Text style={styles.menuText}>Collections</Text>
        </Link>
        
        <Link href="/payments" style={styles.menuItem}>
          <Text style={styles.menuText}>Payments</Text>
        </Link>
        
        <Link href="/sync" style={styles.menuItem}>
          <Text style={styles.menuText}>Sync Status</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 60,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
