import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {User, UserId} from '../../domain/entities/User';
import {UserRepository} from '../../domain/repositories/UserRepository';
import {fromDoc} from './UserMapper';

const COL = 'users';

export class FirestoreUserRepository implements UserRepository {
  private col(): FirebaseFirestoreTypes.CollectionReference {
    return firestore().collection(COL);
  }

  async getAll(onChange?: (users: User[]) => void): Promise<User[]> {
    if (onChange) {
      this.col()
        .where('deleted', '!=', true)
        .onSnapshot({includeMetadataChanges: true}, snap => {
          const users = snap.docs
            .map(d => fromDoc(d))
            .filter(Boolean)
            .map(u => u!)
            .filter(u => !u.deleted);
          onChange(users);
        });
    }
    const snap = await this.col()
      .where('deleted', '!=', true)
      .get({source: 'default'});
    return snap.docs
      .map(d => fromDoc(d))
      .filter(Boolean)
      .map(u => u!)
      .filter(u => !u.deleted);
  }

  async getById(id: UserId): Promise<User | undefined> {
    const snap = await this.col().doc(id).get();
    return fromDoc(snap);
  }

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
  ): Promise<User> {
    const now = Date.now();
    const ref = this.col().doc();
    const toCreate: User = {
      id: ref.id,
      name: data.name,
      email: data.email,
      deleted: !!data.deleted,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    // Firestore transaction for initial create (offline-safe, queued)
    await firestore().runTransaction(async tx => {
      tx.set(ref, {
        name: toCreate.name,
        email: toCreate.email,
        deleted: !!toCreate.deleted,
        createdAt: toCreate.createdAt,
        updatedAt: toCreate.updatedAt,
        version: toCreate.version,
      });
    });
    return toCreate;
  }

  async update(
    id: UserId,
    changes: Partial<Omit<User, 'id' | 'createdAt'>>,
  ): Promise<User> {
    const ref = this.col().doc(id);
    const updated = await firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const current = fromDoc(snap);
      if (!current) throw new Error('User not found');
      const nextVersion = (current.version ?? 0) + 1;
      const now = Date.now();
      const payload: any = {
        ...changes,
        updatedAt: now,
        version: nextVersion,
      };
      // optimistic concurrency: only update if version matches
      // Firestore has no server-side conditional update; emulate in transaction
      tx.update(ref, payload);
      return {
        ...current,
        ...changes,
        updatedAt: now,
        version: nextVersion,
      } as User;
    });
    return updated;
  }

  async delete(id: UserId): Promise<void> {
    const ref = this.col().doc(id);
    await firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const current = fromDoc(snap)!;
      tx.update(ref, {
        deleted: true,
        updatedAt: Date.now(),
        version: (current.version ?? 0) + 1,
      });
    });
  }
}
