import {Platform} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

export const initFirebase = () => {
  // react-native-firebase auto-initializes if google-services files are present.
  // Here we ensure Firestore settings for robust offline behavior.
  firestore().settings({
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  });
  if (Platform.OS === 'android') {
    // persistence is enabled by default on native SDKs; kept for clarity
  }
};
