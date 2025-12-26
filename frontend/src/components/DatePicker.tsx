import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateForInput } from '../utils/formatters';

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  error?: string;
  required?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  maximumDate,
  minimumDate,
}) => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState<Date>(() => {
    // Parse the value or use today's date
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(value);
    }
    return new Date();
  });

  const formatDate = (date: Date): string => {
    return formatDateForInput(date);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = formatDate(selectedDate);
      onChange(formattedDate);
    }
  };

  const displayDate = value || 'Select date';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity
        style={[styles.dateButton, error && styles.dateButtonError]}
        onPress={() => setShow(true)}
      >
        <Text style={[styles.dateText, !value && styles.placeholder]}>
          {displayDate}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
      
      {show && Platform.OS === 'ios' && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => setShow(false)}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
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
  icon: {
    fontSize: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DatePicker;
