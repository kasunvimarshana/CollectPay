import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, json } from '@nozbe/watermelondb/decorators';

export class ProductModel extends Model {
  static table = 'products';

  @field('server_id') serverId!: number;
  @field('name') name!: string;
  @field('code') code!: string;
  @field('unit') unit!: string;
  @field('description') description?: string;
  @field('is_active') isActive!: boolean;
  @json('metadata', (json) => json) metadata?: any;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
