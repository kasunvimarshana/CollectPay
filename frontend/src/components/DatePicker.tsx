import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Input from './Input';

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  error?: string;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
}) => {
  // For now, we use a simple text input for date
  // In a production app, you might want to use a proper date picker library
  // like @react-native-community/datetimepicker
  
  return (
    <Input
      label={label}
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      error={error}
      required={required}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonError: {
    borderColor: '#FF3B30',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});

export default DatePicker;
