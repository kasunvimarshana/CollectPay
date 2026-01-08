/**
 * DateTimePicker Component
 * Reusable date/time picker with native modal support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import THEME from '../../core/constants/theme';

interface DateTimePickerProps {
  label?: string;
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: TextStyle;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder = 'Select date',
  error,
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  minimumDate,
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Parse the value to a Date object
  const parseDate = (dateString: string): Date => {
    if (!dateString) {
      return new Date();
    }
    // Handle YYYY-MM-DD format
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const selectedDate = parseDate(value);

  // Format date for display
  const formatDate = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    
    if (mode === 'date') {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (mode === 'time') {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      // datetime
      return date.toISOString().slice(0, 16).replace('T', ' '); // YYYY-MM-DD HH:MM
    }
  };

  const displayValue = value ? formatDate(selectedDate) : '';

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, the picker closes automatically when a date is selected
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      onChange(formattedDate);
      
      // On iOS, close the picker for date/time only modes after selection
      // Keep open for datetime mode to allow both date and time selection
      if (Platform.OS === 'ios' && mode !== 'datetime') {
        // Auto-close after a short delay for better UX
        setTimeout(() => setShowPicker(false), 500);
      }
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const handleDone = () => {
    setShowPicker(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, error && styles.labelError, labelStyle]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.inputContainer,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          inputStyle,
        ]}
      >
        <Text style={[
          styles.inputText,
          !displayValue && styles.placeholderText,
          disabled && styles.disabledText,
        ]}>
          {displayValue || placeholder}
        </Text>
        <Text style={styles.icon} accessibilityLabel="Calendar icon" accessibilityRole="image">
          📅
        </Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Native DateTimePicker */}
      {showPicker && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={handleDone}>
                  <Text style={styles.iosPickerDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <RNDateTimePicker
                value={selectedDate}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </View>
          )}
          
          {Platform.OS === 'android' && (
            <RNDateTimePicker
              value={selectedDate}
              mode={mode}
              display="default"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.base,
  },
  label: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  labelError: {
    color: THEME.colors.error,
  },
  inputContainer: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputError: {
    borderColor: THEME.colors.error,
  },
  inputDisabled: {
    backgroundColor: THEME.colors.background,
    opacity: 0.6,
  },
  inputText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: THEME.colors.textTertiary,
  },
  disabledText: {
    color: THEME.colors.textTertiary,
  },
  icon: {
    fontSize: THEME.typography.fontSize.xl,
    marginLeft: THEME.spacing.sm,
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.base,
    marginTop: THEME.spacing.xs,
  },
  iosPickerContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    marginTop: THEME.spacing.sm,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  iosPickerDoneButton: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.primary,
  },
});
