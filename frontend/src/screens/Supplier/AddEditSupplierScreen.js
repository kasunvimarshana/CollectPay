import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getDatabase } from '../../database/init';
import uuid from 'react-native-uuid';

const AddEditSupplierScreen = ({ navigation, route }) => {
  const { supplierId } = route.params || {};
  const isEdit = Boolean(supplierId);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    metadata: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadSupplier();
    }
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const supplier = await db.getFirstAsync(
        'SELECT * FROM suppliers WHERE id = ?',
        [supplierId]
      );
      if (supplier) {
        setFormData({
          name: supplier.name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          location: supplier.location || '',
          metadata: supplier.metadata || '',
        });
      }
    } catch (error) {
      console.error('Error loading supplier:', error);
      Alert.alert('Error', 'Failed to load supplier');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();
      
      if (isEdit) {
        // Update existing supplier
        await db.runAsync(
          `UPDATE suppliers SET name = ?, email = ?, phone = ?, location = ?, metadata = ?, updated_at = ? WHERE id = ?`,
          [
            formData.name,
            formData.email || null,
            formData.phone || null,
            formData.location || null,
            formData.metadata || null,
            now,
            supplierId,
          ]
        );

        // Add to sync queue
        await db.runAsync(
          `INSERT INTO sync_queue (client_uuid, entity_type, entity_id, operation, data, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            uuid.v4(),
            'supplier',
            supplierId,
            'update',
            JSON.stringify(formData),
            'pending',
            now,
          ]
        );

        Alert.alert('Success', 'Supplier updated successfully');
      } else {
        // Create new supplier
        const clientUuid = uuid.v4();
        const result = await db.runAsync(
          `INSERT INTO suppliers (client_uuid, name, email, phone, location, metadata, is_synced, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            clientUuid,
            formData.name,
            formData.email || null,
            formData.phone || null,
            formData.location || null,
            formData.metadata || null,
            0,
            now,
            now,
          ]
        );

        // Add to sync queue
        await db.runAsync(
          `INSERT INTO sync_queue (client_uuid, entity_type, entity_id, operation, data, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            uuid.v4(),
            'supplier',
            result.lastInsertRowId,
            'create',
            JSON.stringify({ ...formData, client_uuid: clientUuid }),
            'pending',
            now,
          ]
        );

        Alert.alert('Success', 'Supplier created successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving supplier:', error);
      Alert.alert('Error', 'Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'Edit' : 'Add'} Supplier</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter supplier name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter email address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Enter phone number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Information</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter additional information"
            value={formData.metadata}
            onChangeText={(text) => setFormData({ ...formData, metadata: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Update' : 'Create'} Supplier
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#F44336',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddEditSupplierScreen;
