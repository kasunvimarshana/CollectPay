import React, {useEffect, useMemo, useState} from 'react';
import {SafeAreaView, StatusBar, Text, View, StyleSheet} from 'react-native';
import {AppNavigator} from './src/ui/navigation/AppNavigator';
import {initFirebase} from './src/config/firebase';
import {EventBus} from './src/utils/EventBus';
import {SyncService, SyncEvents} from './src/services/SyncService';

const bus = new EventBus<SyncEvents>();
const sync = new SyncService(bus);

function App(): React.JSX.Element {
  const [online, setOnline] = useState(false);
  const [inSync, setInSync] = useState(true);

  useEffect(() => {
    initFirebase();
    sync.start();
    const off = bus.on('sync:status', s => {
      setOnline(s.online);
      setInSync(s.inSync);
    });
    return () => {
      off();
      sync.stop();
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{online ? 'Online' : 'Offline'} {inSync ? '' : '• syncing...'}</Text>
      </View>
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: {padding: 6, backgroundColor: '#f2f2f2', alignItems: 'center'},
  bannerText: {fontSize: 12, color: '#555'},
});

export default App;
