/**
 * Role List Screen
 * Displays all roles with search and filter capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { Role } from '../../domain/entities/Role';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { Pagination } from '../components/Pagination';
import { SortButton } from '../components/SortButton';

export const RoleListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Debounced search term
  
  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  
  // Server-side sorting state
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadRoles();
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for server-side operations
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const response = await apiClient.get<any>(`/roles?${params.toString()}`);
      if (response.success && response.data) {
        // Handle Laravel pagination response
        const paginatedData = response.data;
        setRoles(paginatedData.data || []);
        setTotalPages(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total || 0);
        setCurrentPage(paginatedData.current_page || 1);
        setPerPage(paginatedData.per_page || 10);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      Alert.alert('Error', 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const getSortDirection = (field: string): 'asc' | 'desc' | null => {
    return sortBy === field ? sortOrder : null;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRolePress = (roleId: number) => {
    (navigation.navigate as any)('RoleDetail', { roleId });
  };

  const handleAddRole = () => {
    (navigation.navigate as any)('RoleForm');
  };

  const renderRoleItem = ({ item }: { item: Role }) => (
    <TouchableOpacity
      style={styles.roleCard}
      onPress={() => handleRolePress(item.id)}
    >
      <View style={styles.roleHeader}>
        <Text style={styles.roleName}>{item.display_name}</Text>
        {item.users_count !== undefined && (
          <View style={styles.userCountBadge}>
            <Text style={styles.userCountText}>
              {item.users_count} user{item.users_count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.roleSystemName}>System: {item.name}</Text>
      <Text style={styles.roleDescription}>{item.description}</Text>
      <Text style={styles.permissionCount}>
        {item.permissions.length} permission{item.permissions.length !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading roles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Roles</Text>
        {canCreate(currentUser, 'roles') && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddRole}>
            <Text style={styles.addButtonText}>+ Add Role</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search roles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <SortButton 
          label="Name" 
          direction={getSortDirection('display_name')}
          onPress={() => handleSort('display_name')} 
        />
        <SortButton 
          label="System Name" 
          direction={getSortDirection('name')}
          onPress={() => handleSort('name')} 
        />
      </View>

      <FlatList
        data={roles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRoleItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No roles found</Text>
          </View>
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={handlePageChange}
        hasNextPage={currentPage < totalPages}
        hasPreviousPage={currentPage > 1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  userCountBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  roleSystemName: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  permissionCount: {
    fontSize: 13,
    color: '#007bff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'flex-start',
  },
});
