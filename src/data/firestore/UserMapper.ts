import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {User} from '../../domain/entities/User';

export const fromDoc = (
  doc: FirebaseFirestoreTypes.DocumentSnapshot,
): User | undefined => {
  const data = doc.data() as any;
  if (!data) return undefined;
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    createdAt: data.createdAt ?? 0,
    updatedAt: data.updatedAt ?? 0,
    version: data.version ?? 0,
    deleted: data.deleted ?? false,
  };
};

export const toData = (u: Partial<User>) => {
  const out: any = {...u};
  return out;
};
