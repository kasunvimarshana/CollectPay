import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiService from '../../application/services/ApiService';

type SupplierDetailRouteProp = RouteProp<RootStackParamList, 'SupplierDetail'>;

const SupplierDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SupplierDetailRouteProp>();
  const isNewSupplier = !route.params?.id;

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [taxId, setTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !contactPerson || !phone || !email || !address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        name,
        contact_person: contactPerson,
        phone,
        email,
        address,
        bank_account: bankAccount || undefined,
        tax_id: taxId || undefined,
      };

      const response = isNewSupplier
        ? await apiService.createSupplier(data)
        : await apiService.updateSupplier(route.params!.id!, data);

      if (response.success) {
        Alert.alert('Success', `Supplier ${isNewSupplier ? 'created' : 'updated'} successfully`);
        navigation.goBack();
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to save supplier');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save supplier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Supplier name"
        />

        <Text style={styles.label}>Contact Person *</Text>
        <TextInput
          style={styles.input}
          value={contactPerson}
          onChangeText={setContactPerson}
          placeholder="Contact person name"
        />

        <Text style={styles.label}>Phone *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Full address"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Bank Account</Text>
        <TextInput
          style={styles.input}
          value={bankAccount}
          onChangeText={setBankAccount}
          placeholder="Bank account number (optional)"
        />

        <Text style={styles.label}>Tax ID</Text>
        <TextInput
          style={styles.input}
          value={taxId}
          onChangeText={setTaxId}
          placeholder="Tax ID number (optional)"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isNewSupplier ? 'Create Supplier' : 'Update Supplier'}
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SupplierDetailScreen;
