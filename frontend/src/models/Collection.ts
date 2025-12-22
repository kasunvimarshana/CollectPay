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

export class PaymentModel extends Model {
  static table = 'payments';

  @field('server_id') serverId?: number;
  @field('client_id') clientId!: string;
  @field('user_id') userId!: number;
  @field('supplier_id') supplierId!: string;
  @field('collection_id') collectionId?: string;
  @field('payment_type') paymentType!: string;
  @field('amount') amount!: number;
  @date('payment_date') paymentDate!: Date;
  @field('payment_method') paymentMethod?: string;
  @field('reference_number') referenceNumber?: string;
  @field('notes') notes?: string;
  @json('metadata', (json) => json) metadata?: any;
  @date('synced_at') syncedAt?: Date;
  @field('version') version!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
