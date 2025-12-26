import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';

export interface PickerOption {
  label: string;
  value: any;
}

interface PickerProps {
  label: string;
  value: any;
  options: PickerOption[];
  onValueChange: (value: any) => void;
  error?: string;
  placeholder?: string;
}

const Picker: React.FC<PickerProps> = ({
  label,
  value,
  options,
  onValueChange,
  error,
  placeholder = 'Select an option',
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, error && styles.pickerButtonError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dce1e6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerButtonError: {
    borderColor: '#e74c3c',
  },
  pickerText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  placeholder: {
    color: '#95a5a6',
  },
  arrow: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  optionSelected: {
    backgroundColor: '#e8f4f8',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  optionTextSelected: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default Picker;
