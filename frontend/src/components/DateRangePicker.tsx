import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DatePicker from './DatePicker';
import Button from './Button';

export interface DateRange {
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
}

interface DateRangePickerProps {
  label: string;
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  error?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(value.startDate);
  const [tempEndDate, setTempEndDate] = useState(value.endDate);

  const presets = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
  ];

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days > 0) {
      start.setDate(start.getDate() - days);
    }
    
    const startStr = formatDateToString(start);
    const endStr = formatDateToString(end);
    
    setTempStartDate(startStr);
    setTempEndDate(endStr);
  };

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleApply = () => {
    onChange({ startDate: tempStartDate, endDate: tempEndDate });
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempStartDate(value.startDate);
    setTempEndDate(value.endDate);
    setModalVisible(false);
  };

  const displayText = value.startDate && value.endDate
    ? `${value.startDate} to ${value.endDate}`
    : 'Select date range';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={[styles.rangeButton, error && styles.rangeButtonError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.rangeText, !value.startDate && styles.placeholder]}>
          {displayText}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetsContainer}>
              <Text style={styles.presetsTitle}>Quick Select:</Text>
              <View style={styles.presetsButtons}>
                {presets.map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={styles.presetButton}
                    onPress={() => applyPreset(preset.days)}
                  >
                    <Text style={styles.presetButtonText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Date Selection */}
            <View style={styles.dateInputsContainer}>
              <DatePicker
                label="Start Date"
                value={tempStartDate}
                onChange={setTempStartDate}
                maximumDate={tempEndDate ? new Date(tempEndDate) : new Date()}
              />
              
              <DatePicker
                label="End Date"
                value={tempEndDate}
                onChange={setTempEndDate}
                minimumDate={tempStartDate ? new Date(tempStartDate) : undefined}
                maximumDate={new Date()}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
                style={styles.actionButton}
              />
              <Button
                title="Apply"
                onPress={handleApply}
                variant="primary"
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  rangeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeButtonError: {
    borderColor: '#FF3B30',
  },
  rangeText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    marginBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  presetsContainer: {
    marginBottom: 20,
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  presetsButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  presetButtonText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  dateInputsContainer: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default DateRangePicker;
