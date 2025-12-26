import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'device_unique_id';

/**
 * Device ID Manager
 * Generates and persists a unique device identifier
 */

/**
 * Get or generate device ID
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to get from SecureStore first
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    
    // Fallback to AsyncStorage
    if (!deviceId) {
      deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    }

    // Generate new ID if not exists
    if (!deviceId) {
      deviceId = generateDeviceId();
      await saveDeviceId(deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Generate temporary ID
    return generateDeviceId();
  }
}

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `device_${timestamp}_${random}`;
}

/**
 * Save device ID to secure storage
 */
async function saveDeviceId(deviceId: string): Promise<void> {
  try {
    // Save to both SecureStore and AsyncStorage for redundancy
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch (error) {
    console.error('Error saving device ID:', error);
  }
}

/**
 * Clear device ID (for testing/debugging)
 */
export async function clearDeviceId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error clearing device ID:', error);
  }
}
