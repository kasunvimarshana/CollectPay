import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, json } from '@nozbe/watermelondb/decorators';

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
