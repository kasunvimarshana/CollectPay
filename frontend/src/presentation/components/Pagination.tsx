/**
 * Pagination Component
 * Reusable pagination controls for list screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  return (
    <View style={styles.container}>
      <Text style={styles.info}>
        Showing {startItem}-{endItem} of {totalItems} items
      </Text>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, !hasPreviousPage && styles.buttonDisabled]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
        >
          <Text style={[styles.buttonText, !hasPreviousPage && styles.buttonTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.button, !hasNextPage && styles.buttonDisabled]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          <Text style={[styles.buttonText, !hasNextPage && styles.buttonTextDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  info: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#007bff',
    minWidth: 100,
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: '#999',
  },
  pageInfo: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});
