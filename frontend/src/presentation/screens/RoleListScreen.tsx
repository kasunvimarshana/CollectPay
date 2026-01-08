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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Role } from '../../domain/entities/Role';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { Pagination, SortButton, ScreenHeader } from '../components';
import THEME from '../../core/constants/theme';

export const RoleListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();
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
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading roles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Roles"
        showBackButton={true}
        variant="light"
        showAddButton={canCreate(currentUser, 'roles')}
        onAddPress={handleAddRole}
        addButtonText="+ Add Role"
      />

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
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + THEME.spacing.base }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No roles found</Text>
          </View>
        }
      />

      <View style={[{ paddingBottom: insets.bottom }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  searchContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  searchInput: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
  },
  listContent: {
    padding: THEME.spacing.base,
  },
  roleCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.base,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.base,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  roleName: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  userCountBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.md,
  },
  userCountText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  roleSystemName: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textTertiary,
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
  },
  permissionCount: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
  emptyContainer: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    justifyContent: 'flex-start',
  },
});
