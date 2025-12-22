import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, json } from '@nozbe/watermelondb/decorators';

export class SupplierModel extends Model {
  static table = 'suppliers';

  @field('server_id') serverId!: number;
  @field('name') name!: string;
  @field('code') code!: string;
  @field('phone') phone?: string;
  @field('address') address?: string;
  @field('area') area?: string;
  @field('is_active') isActive!: boolean;
  @json('metadata', (json) => json) metadata?: any;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
