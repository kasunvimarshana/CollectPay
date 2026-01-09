/**
 * Settings Screen Unit Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SettingsScreen } from '../SettingsScreen';
import { useAuth } from '../../contexts/AuthContext';
import { useNetworkStatus } from '../../../application/hooks/useNetworkStatus';
import LocalStorageService from '../../../infrastructure/storage/LocalStorageService';
import SyncService from '../../../application/services/SyncService';

// Mock dependencies
jest.mock('../../contexts/AuthContext');
jest.mock('../../../application/hooks/useNetworkStatus');
jest.mock('../../../infrastructure/storage/LocalStorageService');
jest.mock('../../../application/services/SyncService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SettingsScreen', () => {
  const mockUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: {
      id: 1,
      name: 'admin',
      display_name: 'Administrator',
      permissions: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isConnected: true,
    });
    (LocalStorageService.getPendingSyncCount as jest.Mock).mockResolvedValue(0);
  });

  describe('Access Control', () => {
    it('should render for admin users', async () => {
      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Settings')).toBeTruthy();
        expect(getByText('Database & Sync Management')).toBeTruthy();
      });
    });

    it('should render for manager users', async () => {
      const managerUser = {
        ...mockUser,
        role: { ...mockUser.role, name: 'manager', display_name: 'Manager' },
      };
      (useAuth as jest.Mock).mockReturnValue({ user: managerUser });

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Settings')).toBeTruthy();
      });
    });

    it('should show access denied for non-admin/manager users', async () => {
      const collectorUser = {
        ...mockUser,
        role: { ...mockUser.role, name: 'collector', display_name: 'Collector' },
      };
      (useAuth as jest.Mock).mockReturnValue({ user: collectorUser });

      render(<SettingsScreen />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Access Denied',
          'You do not have permission to access settings.',
          expect.any(Array)
        );
      });
    });
  });

  describe('Sync Status Display', () => {
    it('should display online status when connected', async () => {
      (useNetworkStatus as jest.Mock).mockReturnValue({ isConnected: true });

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Online')).toBeTruthy();
      });
    });

    it('should display offline status when disconnected', async () => {
      (useNetworkStatus as jest.Mock).mockReturnValue({ isConnected: false });

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Offline')).toBeTruthy();
      });
    });

    it('should display pending changes count', async () => {
      (LocalStorageService.getPendingSyncCount as jest.Mock).mockResolvedValue(5);

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('5')).toBeTruthy();
      });
    });

    it('should display zero pending changes', async () => {
      (LocalStorageService.getPendingSyncCount as jest.Mock).mockResolvedValue(0);

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('0')).toBeTruthy();
      });
    });
  });

  describe('Manual Sync', () => {
    it('should trigger manual sync when button pressed', async () => {
      const mockFullSync = jest.fn().mockResolvedValue({
        success: true,
        message: 'Synced 5 items. 0 failed.',
      });
      (SyncService.fullSync as jest.Mock) = mockFullSync;

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        const syncButton = getByText('Manual Sync');
        fireEvent.press(syncButton);
      });

      await waitFor(() => {
        expect(mockFullSync).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          'Sync Complete',
          'Synced 5 items. 0 failed.',
          expect.any(Array)
        );
      });
    });

    it('should show error alert when sync fails', async () => {
      const mockFullSync = jest.fn().mockResolvedValue({
        success: false,
        message: 'Network error',
      });
      (SyncService.fullSync as jest.Mock) = mockFullSync;

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        const syncButton = getByText('Manual Sync');
        fireEvent.press(syncButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Sync Failed',
          'Network error',
          expect.any(Array)
        );
      });
    });

    it('should not allow sync when offline', async () => {
      (useNetworkStatus as jest.Mock).mockReturnValue({ isConnected: false });

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        const syncButton = getByText('Manual Sync');
        fireEvent.press(syncButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'No Internet Connection',
        'You need an internet connection to sync data with the server.',
        expect.any(Array)
      );
    });

    it('should handle sync exceptions', async () => {
      const mockFullSync = jest.fn().mockRejectedValue(new Error('Timeout'));
      (SyncService.fullSync as jest.Mock) = mockFullSync;

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        const syncButton = getByText('Manual Sync');
        fireEvent.press(syncButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Sync Error',
          'Failed to sync data: Timeout',
          expect.any(Array)
        );
      });
    });
  });

  describe('Clear Database', () => {
    it('should show confirmation dialog when clear button pressed', async () => {
      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        const clearButton = getByText('Clear Local Database');
        fireEvent.press(clearButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Clear Local Database',
        expect.stringContaining('permanently delete all locally stored data'),
        expect.any(Array),
        expect.any(Object)
      );
    });

    it('should clear database when confirmed', async () => {
      const mockClearAllData = jest.fn().mockResolvedValue(undefined);
      (LocalStorageService.clearAllData as jest.Mock) = mockClearAllData;

      // Mock Alert.alert to automatically confirm
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (title === 'Clear Local Database') {
          const confirmButton = buttons.find((b: any) => b.text === 'Clear Database');
          if (confirmButton && confirmButton.onPress) {
            confirmButton.onPress();
          }
        }
      });

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        const clearButton = getByText('Clear Local Database');
        fireEvent.press(clearButton);
      });

      await waitFor(() => {
        expect(mockClearAllData).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Local database has been cleared successfully.',
          expect.any(Array)
        );
      });
    });

    it('should handle clear database errors', async () => {
      const mockClearAllData = jest
        .fn()
        .mockRejectedValue(new Error('Database locked'));
      (LocalStorageService.clearAllData as jest.Mock) = mockClearAllData;

      // Mock Alert.alert to automatically confirm
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (title === 'Clear Local Database') {
          const confirmButton = buttons.find((b: any) => b.text === 'Clear Database');
          if (confirmButton && confirmButton.onPress) {
            confirmButton.onPress();
          }
        }
      });

      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        const clearButton = getByText('Clear Local Database');
        fireEvent.press(clearButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to clear database: Database locked',
          expect.any(Array)
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should have a back button', async () => {
      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('← Back')).toBeTruthy();
      });
    });
  });

  describe('Information Display', () => {
    it('should display sync information section', async () => {
      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Synchronization')).toBeTruthy();
        expect(getByText('Connection Status:')).toBeTruthy();
        expect(getByText('Pending Changes:')).toBeTruthy();
      });
    });

    it('should display database management section', async () => {
      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Database Management')).toBeTruthy();
        expect(
          getByText(
            '⚠️ This will permanently delete all local data including pending changes. Use with caution.'
          )
        ).toBeTruthy();
      });
    });

    it('should display about section', async () => {
      const { getByText } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('About')).toBeTruthy();
        expect(
          getByText(
            'Settings screen provides operational tools for database maintenance and synchronization.'
          )
        ).toBeTruthy();
      });
    });
  });
});
