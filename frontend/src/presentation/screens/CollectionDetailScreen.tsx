/**
 * Collection Detail Screen
 * Displays detailed collection information
 */

import React, { useState, useEffect } from 'react';
import THEME from '../../core/constants/theme';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Collection } from '../../domain/entities/Collection';
import Logger from '../../core/utils/Logger';

export const CollectionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const collectionId = (route.params as any)?.collectionId;
  const insets = useSafeAreaInsets();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      const response = await apiClient.get(`/collections/${collectionId}`);
      if (response.success) {
        setCollection(response.data as any);
      }
    } catch (error) {
      Logger.error('Error loading collection', error);
      Alert.alert('Error', 'Failed to load collection details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    (navigation.navigate as any)('CollectionForm', { collectionId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/collections/${collectionId}`);
      Alert.alert('Success', 'Collection deleted successfully');
      navigation.goBack();
    } catch (error) {
      Logger.error('Error deleting collection', error);
      Alert.alert('Error', 'Failed to delete collection');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading collection...</Text>
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Collection not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Collection Details</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Supplier:</Text>
          <Text style={styles.detailValue}>{String(collection.supplier?.name || 'Unknown')}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Product:</Text>
          <Text style={styles.detailValue}>{String(collection.product?.name || 'Unknown')}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Collection Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(collection.collection_date).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>
            {String(collection.quantity)} {String(collection.unit)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rate Applied:</Text>
          <Text style={styles.detailValue}>
            {String(collection.rate_applied)} per {String(collection.unit)}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>
            {typeof collection.total_amount === 'number' || typeof collection.total_amount === 'string' ? (Number(collection.total_amount) || 0).toFixed(2) : '0.00'}
          </Text>
        </View>

        {collection.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{String(collection.notes)}</Text>
          </View>
        )}

        {collection.user && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recorded By:</Text>
            <Text style={styles.detailValue}>{String(collection.user.name)}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    marginBottom: THEME.spacing.sm,
  },
  backButtonText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.primary,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  section: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    marginTop: THEME.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    width: 140,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.base,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  totalLabel: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
  },
  totalValue: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.primary,
  },
  notesContainer: {
    marginTop: THEME.spacing.base,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.gray50,
    borderRadius: THEME.borderRadius.base,
  },
  notesLabel: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: THEME.spacing.base,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  editButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: THEME.colors.error,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.lg,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.base,
  },
  backText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.primary,
  },
});
