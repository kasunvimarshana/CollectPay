/**
 * Printer Status Indicator Component
 * Displays current printer connection status
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PrinterConnectionStatus } from '../../domain/entities/Printer';
import PrintService from '../../application/services/PrintService';
import THEME from '../../core/constants/theme';

interface PrinterStatusIndicatorProps {
  onPress?: () => void;
}

export const PrinterStatusIndicator: React.FC<PrinterStatusIndicatorProps> = ({ onPress }) => {
  const [status, setStatus] = useState<string>(PrinterConnectionStatus.DISCONNECTED);
  const [pendingJobs, setPendingJobs] = useState<number>(0);

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async () => {
    try {
      const printService = PrintService.getInstance();
      const currentStatus = printService.getConnectionStatus();
      const jobsCount = await printService.getPendingJobsCount();
      
      setStatus(currentStatus);
      setPendingJobs(jobsCount);
    } catch (error) {
      // Ignore errors
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case PrinterConnectionStatus.CONNECTED:
        return THEME.colors.success;
      case PrinterConnectionStatus.CONNECTING:
      case PrinterConnectionStatus.PRINTING:
        return THEME.colors.warning;
      case PrinterConnectionStatus.ERROR:
        return THEME.colors.error;
      default:
        return THEME.colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case PrinterConnectionStatus.CONNECTED:
        return '🖨️';
      case PrinterConnectionStatus.CONNECTING:
        return '🔄';
      case PrinterConnectionStatus.PRINTING:
        return '📄';
      case PrinterConnectionStatus.ERROR:
        return '⚠️';
      default:
        return '🖨️';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case PrinterConnectionStatus.CONNECTED:
        return 'Printer Connected';
      case PrinterConnectionStatus.CONNECTING:
        return 'Connecting...';
      case PrinterConnectionStatus.PRINTING:
        return 'Printing...';
      case PrinterConnectionStatus.ERROR:
        return 'Printer Error';
      default:
        return 'No Printer';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: getStatusColor() }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{getStatusIcon()}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {pendingJobs > 0 && (
          <Text style={styles.pendingText}>
            {pendingJobs} pending job{pendingJobs > 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
    borderWidth: 1,
    ...THEME.shadows.sm,
  },
  icon: {
    fontSize: 20,
    marginRight: THEME.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  pendingText: {
    fontSize: THEME.typography.fontSize.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
});

export default PrinterStatusIndicator;
