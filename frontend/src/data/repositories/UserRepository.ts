/**
 * User Repository Implementation
 * Combines local and remote data sources with offline support
 */

import { User } from '../../domain/entities/User';
import { UserRepositoryInterface } from '../../domain/repositories/UserRepositoryInterface';
import { LocalDatabase } from '../datasources/LocalDatabase';
import { RemoteUserDataSource } from '../datasources/RemoteUserDataSource';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository implements UserRepositoryInterface {
  constructor(
    private localDb: LocalDatabase,
    private remoteDataSource: RemoteUserDataSource,
    private isOnline: () => boolean
  ) {}

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    // Save to local database
    await this.localDb.execute(
      `INSERT INTO users (id, email, name, password_hash, role, is_active, created_at, updated_at, version, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.name, user.passwordHash, user.role, user.isActive ? 1 : 0, user.createdAt, user.updatedAt, user.version, 'pending']
    );

    // Try to sync if online
    if (this.isOnline()) {
      try {
        const syncedUser = await this.remoteDataSource.create(data);
        // Update local with server response
        await this.localDb.execute(
          `UPDATE users SET sync_status = 'synced', last_synced_at = ? WHERE id = ?`,
          [now, user.id]
        );
        return syncedUser;
      } catch (error) {
        // If sync fails, keep as pending
        console.error('Failed to sync user creation:', error);
      }
    }

    return user;
  }

  async getById(id: string): Promise<User | null> {
    // Try local first
    const localUser = await this.localDb.queryOne<any>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (localUser) {
      return this.mapDbToEntity(localUser);
    }

    // Try remote if online
    if (this.isOnline()) {
      try {
        const remoteUser = await this.remoteDataSource.getById(id);
        // Cache in local
        await this.saveToLocal(remoteUser);
        return remoteUser;
      } catch (error) {
        console.error('Failed to fetch user from remote:', error);
      }
    }

    return null;
  }

  async getByEmail(email: string): Promise<User | null> {
    // Try local first
    const localUser = await this.localDb.queryOne<any>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (localUser) {
      return this.mapDbToEntity(localUser);
    }

    // Try remote if online
    if (this.isOnline()) {
      try {
        const remoteUser = await this.remoteDataSource.getByEmail(email);
        // Cache in local
        await this.saveToLocal(remoteUser);
        return remoteUser;
      } catch (error) {
        console.error('Failed to fetch user from remote:', error);
      }
    }

    return null;
  }

  async getAll(page: number = 1, limit: number = 20): Promise<User[]> {
    // Try remote if online
    if (this.isOnline()) {
      try {
        const remoteUsers = await this.remoteDataSource.getAll(page, limit);
        // Cache in local
        for (const user of remoteUsers) {
          await this.saveToLocal(user);
        }
        return remoteUsers;
      } catch (error) {
        console.error('Failed to fetch users from remote:', error);
      }
    }

    // Fallback to local
    const offset = (page - 1) * limit;
    const localUsers = await this.localDb.query<any>(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return localUsers.map(this.mapDbToEntity);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    const now = new Date().toISOString();
    const updated: User = {
      ...existing,
      ...data,
      id,
      updatedAt: now,
      version: existing.version + 1,
    };

    // Update local
    await this.localDb.execute(
      `UPDATE users SET 
        email = ?, name = ?, password_hash = ?, role = ?, is_active = ?,
        updated_at = ?, version = ?, sync_status = 'pending'
       WHERE id = ?`,
      [updated.email, updated.name, updated.passwordHash, updated.role, updated.isActive ? 1 : 0, updated.updatedAt, updated.version, id]
    );

    // Try to sync if online
    if (this.isOnline()) {
      try {
        const syncedUser = await this.remoteDataSource.update(id, data);
        // Update sync status
        await this.localDb.execute(
          `UPDATE users SET sync_status = 'synced', last_synced_at = ? WHERE id = ?`,
          [now, id]
        );
        return syncedUser;
      } catch (error) {
        console.error('Failed to sync user update:', error);
      }
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    // Delete from local
    await this.localDb.execute('DELETE FROM users WHERE id = ?', [id]);

    // Try to sync if online
    if (this.isOnline()) {
      try {
        await this.remoteDataSource.delete(id);
      } catch (error) {
        console.error('Failed to sync user deletion:', error);
      }
    }

    return true;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.getByEmail(email);
    return user !== null;
  }

  private async saveToLocal(user: User): Promise<void> {
    const now = new Date().toISOString();
    await this.localDb.execute(
      `INSERT OR REPLACE INTO users 
       (id, email, name, password_hash, role, is_active, created_at, updated_at, version, sync_status, last_synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.name, user.passwordHash, user.role, user.isActive ? 1 : 0, 
       user.createdAt, user.updatedAt, user.version, 'synced', now]
    );
  }

  private mapDbToEntity(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      version: row.version,
    };
  }
}
