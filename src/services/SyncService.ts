import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import {EventBus} from '../utils/EventBus';

export type SyncEvents = {
  'sync:status': {online: boolean; inSync: boolean};
};

export class SyncService {
  private unsubNet?: () => void;

  constructor(private bus: EventBus<SyncEvents>) {}

  start() {
    this.unsubNet = NetInfo.addEventListener(state => {
      this.bus.emit('sync:status', {
        online: !!state.isInternetReachable,
        inSync: false,
      });
    });
    // RN Firebase does not expose onSnapshotsInSync; we rely on network status
    // and let Firestore handle background sync. Emit a best-effort status.
    this.bus.emit('sync:status', {online: true, inSync: true});
  }

  stop() {
    this.unsubNet?.();
  }
}
