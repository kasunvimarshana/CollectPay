/**
 * RateInfo Component
 * Displays product rate information and history link
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Rate } from '../../domain/entities/Product';
import { Card } from './Card';
import THEME from '../../core/constants/theme';

interface RateInfoProps {
  rate: Rate;
  onViewHistory: () => void;
}

export const RateInfo: React.FC<RateInfoProps> = ({ 
  rate, 
  onViewHistory 
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Current Rate</Text>
      
      <View style={styles.rateCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rate:</Text>
          <Text style={styles.detailValue}>
            {String(rate.rate)} per {String(rate.unit)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Effective From:</Text>
          <Text style={styles.detailValue}>
            {new Date(rate.effective_from).toLocaleDateString()}
          </Text>
        </View>
        
        {rate.effective_to && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Effective To:</Text>
            <Text style={styles.detailValue}>
              {new Date(rate.effective_to).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onViewHistory}
      >
        <Text style={styles.secondaryButtonText}>View Rate History</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: THEME.spacing.base,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.md,
  },
  rateCard: {
    backgroundColor: THEME.colors.gray100,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.md,
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
  secondaryButton: {
    backgroundColor: THEME.colors.gray600,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
