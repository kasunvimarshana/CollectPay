import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {FirestoreUserRepository} from '../../data/firestore/FirestoreUserRepository';
import {CreateUser, UpdateUser} from '../../domain/usecases';

const repo = new FirestoreUserRepository();
const createUser = new CreateUser(repo);
const updateUser = new UpdateUser(repo);

export const UserFormScreen = ({navigation, route}: NativeStackScreenProps<RootStackParamList, 'UserForm'>) => {
  const id = route.params?.id;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (id) {
      repo.getById(id).then(u => {
        if (u) {
          setName(u.name);
          setEmail(u.email);
        }
      });
    }
  }, [id]);

  const onSave = async () => {
    try {
      if (id) {
        await updateUser.execute(id, {name, email});
      } else {
        await createUser.execute({name, email});
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  label: {marginTop: 12, color: '#333'},
  input: {borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginTop: 8},
  button: {marginTop: 24, backgroundColor: '#1e90ff', padding: 14, borderRadius: 8, alignItems: 'center'},
  buttonText: {color: '#fff', fontWeight: '600'},
});
