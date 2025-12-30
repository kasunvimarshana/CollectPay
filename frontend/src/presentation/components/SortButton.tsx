/**
 * Sort Button Component
 * Reusable sort button for list screens
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type SortDirection = 'asc' | 'desc' | null;

interface SortButtonProps {
  label: string;
  direction: SortDirection;
  onPress: () => void;
}

export const SortButton: React.FC<SortButtonProps> = ({ label, direction, onPress }) => {
  const getSortIcon = () => {
    if (!direction) return '⇅';
    return direction === 'asc' ? '↑' : '↓';
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={[styles.label, direction && styles.activeLabel]}>
        {label} <Text style={styles.icon}>{getSortIcon()}</Text>
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#007bff',
    fontWeight: '600',
  },
  icon: {
    fontSize: 14,
  },
});
