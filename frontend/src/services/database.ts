import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { CollectionModel } from '../models/Collection';
import { PaymentModel } from '../models/Payment';
import { SupplierModel } from '../models/Supplier';
import { ProductModel } from '../models/Product';
import { schema } from '../models/schema';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'collectpay',
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    CollectionModel,
    PaymentModel,
    SupplierModel,
    ProductModel,
  ],
});
