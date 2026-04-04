/**
 * Printer Settings Screen
 * Manages printer connections and settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PrinterDevice, PrinterSettings as PrinterSettingsType } from '../../domain/entities/Printer';
import PrintService from '../../application/services/PrintService';
import { ScreenHeader } from '../components';
import THEME from '../../core/constants/theme';
import Logger from '../../core/utils/Logger';

export const PrinterSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<PrinterDevice | null>(null);
  const [settings, setSettings] = useState<PrinterSettingsType | null>(null);
  const [pendingJobs, setPendingJobs] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const printService = PrintService.getInstance();
      
      // Load connected device
      const device = await printService.getConnectedDevice();
      setConnectedDevice(device);
      
      // Load saved devices
      const savedDevices = await printService.getSavedDevices();
      setDevices(savedDevices);
      
      // Load settings
      const currentSettings = await printService.getSettings();
      setSettings(currentSettings);
      
      // Load pending jobs
      const jobsCount = await printService.getPendingJobsCount();
      setPendingJobs(jobsCount);
    } catch (error) {
      Logger.error('Failed to load printer data', error, 'PrinterSettingsScreen');
      Alert.alert('Error', 'Failed to load printer settings');
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      const printService = PrintService.getInstance();
      const scannedDevices = await printService.scanForDevices();
      
      setDevices(scannedDevices);
      
      if (scannedDevices.length === 0) {
        Alert.alert('No Devices Found', 'No Bluetooth printers were found nearby. Make sure your printer is turned on and in pairing mode.');
      }
    } catch (error) {
      Logger.error('Scan failed', error, 'PrinterSettingsScreen');
      Alert.alert('Scan Failed', 'Unable to scan for devices. Please check Bluetooth permissions.');
    } finally {
      setScanning(false);
    }
  };

  const handleConnect = async (deviceId: string) => {
    try {
      setConnecting(true);
      const printService = PrintService.getInstance();
      const success = await printService.connect(deviceId);
      
      if (success) {
        Alert.alert('Success', 'Printer connected successfully');
        await loadData();
      } else {
        Alert.alert('Connection Failed', 'Unable to connect to the printer');
      }
    } catch (error) {
      Logger.error('Connection failed', error, 'PrinterSettingsScreen');
      Alert.alert('Error', 'Connection failed. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const printService = PrintService.getInstance();
      await printService.disconnect();
      
      setConnectedDevice(null);
      Alert.alert('Disconnected', 'Printer disconnected successfully');
    } catch (error) {
      Logger.error('Disconnect failed', error, 'PrinterSettingsScreen');
      Alert.alert('Error', 'Failed to disconnect printer');
    }
  };

  const handleProcessQueue = async () => {
    try {
      if (pendingJobs === 0) {
        Alert.alert('No Jobs', 'There are no pending print jobs');
        return;
      }
      
      const printService = PrintService.getInstance();
      await printService.processPrintQueue();
      
      Alert.alert('Success', 'Print queue processed');
      await loadData();
    } catch (error) {
      Logger.error('Queue processing failed', error, 'PrinterSettingsScreen');
      Alert.alert('Error', 'Failed to process print queue');
    }
  };

  const handleSettingChange = async (key: keyof PrinterSettingsType, value: any) => {
    try {
      const printService = PrintService.getInstance();
      await printService.updateSettings({ [key]: value });
      
      setSettings(prev => prev ? { ...prev, [key]: value } : null);
    } catch (error) {
      Logger.error('Failed to update setting', error, 'PrinterSettingsScreen');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Printer Settings"
        showBackButton={true}
        variant="light"
      />

      <ScrollView style={styles.content}>
        {/* Connected Printer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Printer</Text>
          
          {connectedDevice ? (
            <View style={styles.deviceCard}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceIcon}>🖨️</Text>
                <View style={styles.deviceDetails}>
                  <Text style={styles.deviceName}>{connectedDevice.name}</Text>
                  <Text style={styles.deviceStatus}>✓ Connected</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.disconnectButton}
                onPress={handleDisconnect}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No printer connected</Text>
            </View>
          )}
        </View>

        {/* Print Queue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Print Queue</Text>
          
          <View style={styles.queueCard}>
            <Text style={styles.queueCount}>
              {pendingJobs} pending job{pendingJobs !== 1 ? 's' : ''}
            </Text>
            {pendingJobs > 0 && (
              <TouchableOpacity 
                style={styles.processButton}
                onPress={handleProcessQueue}
              >
                <Text style={styles.processButtonText}>Process Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Available Devices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Devices</Text>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={handleScan}
              disabled={scanning}
            >
              {scanning ? (
                <ActivityIndicator size="small" color={THEME.colors.white} />
              ) : (
                <Text style={styles.scanButtonText}>Scan</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {scanning ? 'Scanning...' : 'No devices found. Tap Scan to search.'}
              </Text>
            </View>
          ) : (
            devices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceIcon}>🖨️</Text>
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    {device.lastConnected && (
                      <Text style={styles.deviceMeta}>
                        Last used: {new Date(device.lastConnected).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
                {device.id !== connectedDevice?.id && (
                  <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={() => handleConnect(device.id)}
                    disabled={connecting}
                  >
                    {connecting ? (
                      <ActivityIndicator size="small" color={THEME.colors.white} />
                    ) : (
                      <Text style={styles.connectButtonText}>Connect</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Settings */}
        {settings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Printer Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto Retry Failed Jobs</Text>
              <Switch
                value={settings.autoRetry}
                onValueChange={(value) => handleSettingChange('autoRetry', value)}
                trackColor={{ false: THEME.colors.gray300, true: THEME.colors.primary }}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Fallback to PDF</Text>
              <Switch
                value={settings.fallbackToPDF}
                onValueChange={(value) => handleSettingChange('fallbackToPDF', value)}
                trackColor={{ false: THEME.colors.gray300, true: THEME.colors.primary }}
              />
            </View>
            
            <View style={styles.settingInfo}>
              <Text style={styles.settingInfoText}>
                • Max Retries: {settings.maxRetries}
              </Text>
              <Text style={styles.settingInfoText}>
                • Retry Delay: {settings.retryDelay / 1000}s
              </Text>
              <Text style={styles.settingInfoText}>
                • Paper Width: {settings.paperWidth}mm
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: THEME.spacing.base,
    marginBottom: THEME.spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.base,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.base,
  },
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.sm,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    fontSize: 32,
    marginRight: THEME.spacing.base,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.success,
  },
  deviceMeta: {
    fontSize: THEME.typography.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
  connectButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
    minWidth: 80,
    alignItems: 'center',
  },
  connectButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  disconnectButton: {
    backgroundColor: THEME.colors.error,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
  },
  disconnectButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  scanButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
    minWidth: 70,
    alignItems: 'center',
  },
  scanButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  emptyState: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textTertiary,
    textAlign: 'center',
  },
  queueCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...THEME.shadows.sm,
  },
  queueCount: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  processButton: {
    backgroundColor: THEME.colors.success,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
  },
  processButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.sm,
  },
  settingLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  settingInfo: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    ...THEME.shadows.sm,
  },
  settingInfoText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
});

export default PrinterSettingsScreen;
