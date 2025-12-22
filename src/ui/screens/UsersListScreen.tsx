import React, {useEffect, useMemo} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useUsersStore} from '../../store/usersStore';
import {FirestoreUserRepository} from '../../data/firestore/FirestoreUserRepository';
import {GetUsers, DeleteUser} from '../../domain/usecases';

const repo = new FirestoreUserRepository();
const getUsers = new GetUsers(repo);
const deleteUser = new DeleteUser(repo);

export const UsersListScreen = ({navigation}: NativeStackScreenProps<RootStackParamList, 'Users'>) => {
  const users = useUsersStore(s => s.users);
  const setUsers = useUsersStore(s => s.setUsers);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    getUsers.execute(list => setUsers(list));
  }, [setUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    const list = await getUsers.execute();
    setUsers(list);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('UserForm', {id: item.id})}>
            <View style={{flex: 1}}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.email}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteUser.execute(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No users yet. Add one!</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('UserForm')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  item: {flexDirection: 'row', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee', alignItems: 'center'},
  title: {fontSize: 16, fontWeight: '600'},
  subtitle: {fontSize: 12, color: '#666'},
  delete: {color: '#c00', fontWeight: '600'},
  empty: {textAlign: 'center', marginTop: 40, color: '#999'},
  fab: {position: 'absolute', right: 16, bottom: 32, backgroundColor: '#1e90ff', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4},
  fabText: {color: '#fff', fontSize: 28, lineHeight: 28},
});
