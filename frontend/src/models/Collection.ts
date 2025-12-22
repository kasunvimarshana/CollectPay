import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, json } from '@nozbe/watermelondb/decorators';

export class CollectionModel extends Model {
  static table = 'collections';

  @field('server_id') serverId?: number;
  @field('client_id') clientId!: string;
  @field('user_id') userId!: number;
  @field('supplier_id') supplierId!: string;
  @field('product_id') productId!: string;
  @field('quantity') quantity!: number;
  @field('unit') unit!: string;
  @field('rate') rate!: number;
  @field('amount') amount!: number;
  @date('collection_date') collectionDate!: Date;
  @field('notes') notes?: string;
  @json('metadata', (json) => json) metadata?: any;
  @date('synced_at') syncedAt?: Date;
  @field('version') version!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
