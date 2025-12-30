/**
 * ConflictNotification Component
 * Displays conflict resolution notifications to users
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants/colors';

export interface ConflictInfo {
  entity: string;
  entityName: string;
  localChanges: string[];
  serverChanges: string[];
  resolvedVersion: number;
}

interface ConflictNotificationProps {
  visible: boolean;
  conflict: ConflictInfo | null;
  onDismiss: () => void;
  onViewDetails?: () => void;
}

export const ConflictNotification: React.FC<ConflictNotificationProps> = ({
  visible,
  conflict,
  onDismiss,
  onViewDetails,
}) => {
  if (!conflict) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="warning" size={32} color={COLORS.warning} />
            <Text style={styles.title}>Sync Conflict Detected</Text>
          </View>

          {/* Message */}
          <View style={styles.content}>
            <Text style={styles.message}>
              Your changes to <Text style={styles.entityName}>"{conflict.entityName}"</Text> could not be saved
              because another user modified this record.
            </Text>

            <Text style={styles.subMessage}>
              Server data has been applied to maintain consistency.
            </Text>

            {/* Your Changes */}
            {conflict.localChanges.length > 0 && (
              <View style={styles.changeSection}>
                <Text style={styles.sectionTitle}>Your changes:</Text>
                {conflict.localChanges.map((change, index) => (
                  <Text key={index} style={styles.changeItem}>
                    • {change}
                  </Text>
                ))}
              </View>
            )}

            {/* Server Changes */}
            {conflict.serverChanges.length > 0 && (
              <View style={styles.changeSection}>
                <Text style={styles.sectionTitle}>Server changes (applied):</Text>
                {conflict.serverChanges.map((change, index) => (
                  <Text key={index} style={[styles.changeItem, styles.serverChange]}>
                    ✓ {change}
                  </Text>
                ))}
              </View>
            )}

            {/* Resolution Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color={COLORS.info} />
              <Text style={styles.infoText}>
                Record version: {conflict.resolvedVersion}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {onViewDetails && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onViewDetails}
              >
                <Text style={styles.secondaryButtonText}>View Details</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onDismiss}
            >
              <Text style={styles.primaryButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  content: {
    padding: 20,
  },
  message: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  entityName: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  subMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  changeSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  changeItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: 8,
  },
  serverChange: {
    color: COLORS.success,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.info,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
