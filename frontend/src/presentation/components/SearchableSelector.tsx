/**
 * SearchableSelector Component
 * Reusable searchable selector with backend support
 * Supports search, pagination, and loading states
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import THEME from '../../core/constants/theme';
import apiClient from '../../infrastructure/api/apiClient';

export interface SearchableSelectorOption {
  id: number | string;
  name: string;
  [key: string]: any;
}

interface SearchableSelectorProps {
  label: string;
  placeholder?: string;
  value: string;
  onSelect: (value: string, option?: SearchableSelectorOption) => void;
  endpoint: string;
  searchKey?: string;
  renderOption?: (option: SearchableSelectorOption) => React.ReactNode;
  error?: string;
  disabled?: boolean;
  queryParams?: Record<string, any>;
}

export const SearchableSelector: React.FC<SearchableSelectorProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  onSelect,
  endpoint,
  searchKey = 'search',
  renderOption,
  error,
  disabled = false,
  queryParams = {},
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<SearchableSelectorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SearchableSelectorOption | null>(null);

  // Load initial options when modal opens
  useEffect(() => {
    if (modalVisible) {
      loadOptions(1, '');
    }
  }, [modalVisible]);

  // Debounced search
  useEffect(() => {
    if (!modalVisible) return;

    const timeoutId = setTimeout(() => {
      loadOptions(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load selected option display value
  useEffect(() => {
    if (value && !selectedOption) {
      loadSelectedOption();
    }
  }, [value]);

  const loadSelectedOption = async () => {
    if (!value) return;
    
    try {
      // Try to find in loaded options first
      const existing = options.find(opt => opt.id.toString() === value);
      if (existing) {
        setSelectedOption(existing);
        return;
      }

      // Otherwise fetch from API
      const response = await apiClient.get<any>(`${endpoint}/${value}`);
      if (response.success && response.data) {
        setSelectedOption(response.data);
      }
    } catch (error) {
      console.error('Error loading selected option:', error);
    }
  };

  const loadOptions = async (pageNum: number, search: string) => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pageNum,
        per_page: 20,
        ...queryParams,
      };

      if (search) {
        params[searchKey] = search;
      }

      const response = await apiClient.get<any>(endpoint, { params });
      
      if (response.success && response.data) {
        // Handle paginated response
        const data = response.data.data || response.data;
        const newOptions = Array.isArray(data) ? data : [data];

        if (pageNum === 1) {
          setOptions(newOptions);
        } else {
          setOptions(prev => [...prev, ...newOptions]);
        }

        // Check if there are more pages
        const meta = response.data.meta || response.data;
        if (meta.current_page && meta.last_page) {
          setHasMore(meta.current_page < meta.last_page);
        } else {
          setHasMore(newOptions.length >= 20);
        }
      }
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: SearchableSelectorOption) => {
    setSelectedOption(option);
    onSelect(option.id.toString(), option);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOptions(nextPage, searchQuery);
    }
  };

  const defaultRenderOption = (option: SearchableSelectorOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionItem,
        value === option.id.toString() && styles.optionItemSelected,
      ]}
      onPress={() => handleSelect(option)}
    >
      <Text style={[
        styles.optionText,
        value === option.id.toString() && styles.optionTextSelected,
      ]}>
        {option.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.selector,
          error && styles.selectorError,
          disabled && styles.selectorDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.selectorText,
          !selectedOption && styles.selectorPlaceholder,
        ]}>
          {selectedOption?.name || placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            {/* Options List */}
            {loading && page === 1 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={styles.loadingText}>Loading options...</Text>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <>{renderOption ? renderOption(item) : defaultRenderOption(item)}</>
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  loading && page > 1 ? (
                    <View style={styles.footerLoading}>
                      <ActivityIndicator size="small" color={THEME.colors.primary} />
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No options found</Text>
                  </View>
                }
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.lg,
  },
  label: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  selector: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorError: {
    borderColor: THEME.colors.error,
  },
  selectorDisabled: {
    backgroundColor: THEME.colors.gray100,
    opacity: 0.6,
  },
  selectorText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  selectorPlaceholder: {
    color: THEME.colors.textSecondary,
  },
  dropdownIcon: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginLeft: THEME.spacing.sm,
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.base,
    marginTop: THEME.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.lg,
    borderTopRightRadius: THEME.borderRadius.lg,
    maxHeight: '80%',
    paddingBottom: THEME.spacing.base,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  modalTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  closeButton: {
    padding: THEME.spacing.sm,
  },
  closeButtonText: {
    fontSize: THEME.typography.fontSize.xl,
    color: THEME.colors.textSecondary,
  },
  searchContainer: {
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  searchInput: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
  },
  optionItem: {
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  optionItemSelected: {
    backgroundColor: THEME.colors.gray100,
  },
  optionText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xxl,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
  footerLoading: {
    padding: THEME.spacing.base,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: THEME.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
});
