/**
 * Offline Payment Repository
 * Decorates ApiPaymentRepository with offline support
 * Following Clean Architecture - Infrastructure Layer
 */

import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { Payment } from '../../domain/entities/Payment';
import { localDatabase } from '../storage/LocalDatabaseService';
import { networkMonitor } from '../network/NetworkMonitoringService';
import { EnqueueOperationUseCase } from '../../application/useCases/EnqueueOperationUseCase';
import { SyncOperationType, SyncEntityType } from '../../domain/entities/SyncOperation';
import { LocalSyncQueueRepository } from './LocalSyncQueueRepository';

const COLLECTION_NAME = 'payments';

export class OfflinePaymentRepository implements PaymentRepository {
  private syncQueueRepository = new LocalSyncQueueRepository();
  private enqueueUseCase = new EnqueueOperationUseCase(this.syncQueueRepository);

  constructor(private onlineRepository: PaymentRepository) {}

  public async findAll(): Promise<Payment[]> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const payments = await this.onlineRepository.findAll();
        
        for (const payment of payments) {
          await localDatabase.save(COLLECTION_NAME, payment.getId(), this.toJSON(payment));
        }
        
        return payments;
      } catch (error) {
        console.warn('Failed to fetch payments from API, using cache:', error);
        return this.findAllFromCache();
      }
    } else {
      return this.findAllFromCache();
    }
  }

  public async findById(id: string): Promise<Payment | null> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const payment = await this.onlineRepository.findById(id);
        
        if (payment) {
          await localDatabase.save(COLLECTION_NAME, id, this.toJSON(payment));
        }
        
        return payment;
      } catch (error) {
        console.warn(`Failed to fetch payment ${id} from API, using cache:`, error);
        return this.findByIdFromCache(id);
      }
    } else {
      return this.findByIdFromCache(id);
    }
  }

  public async findBySupplierId(supplierId: string): Promise<Payment[]> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const payments = await this.onlineRepository.findBySupplierId(supplierId);
        
        for (const payment of payments) {
          await localDatabase.save(COLLECTION_NAME, payment.getId(), this.toJSON(payment));
        }
        
        return payments;
      } catch (error) {
        console.warn(`Failed to fetch payments for supplier ${supplierId}, using cache:`, error);
        return this.findBySupplierFromCache(supplierId);
      }
    } else {
      return this.findBySupplierFromCache(supplierId);
    }
  }

  public async create(payment: Payment): Promise<Payment> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.save(COLLECTION_NAME, payment.getId(), this.toJSON(payment));

    if (networkState.canSync()) {
      try {
        const created = await this.onlineRepository.create(payment);
        await localDatabase.save(COLLECTION_NAME, created.getId(), this.toJSON(created));
        return created;
      } catch (error) {
        console.warn('Failed to create payment on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.PAYMENT,
          operationType: SyncOperationType.CREATE,
          entityId: payment.getId(),
          data: this.toJSON(payment),
        });
        
        return payment;
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.PAYMENT,
        operationType: SyncOperationType.CREATE,
        entityId: payment.getId(),
        data: this.toJSON(payment),
      });
      
      return payment;
    }
  }

  public async update(payment: Payment): Promise<Payment> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.save(COLLECTION_NAME, payment.getId(), this.toJSON(payment));

    if (networkState.canSync()) {
      try {
        const updated = await this.onlineRepository.update(payment);
        await localDatabase.save(COLLECTION_NAME, updated.getId(), this.toJSON(updated));
        return updated;
      } catch (error) {
        console.warn('Failed to update payment on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.PAYMENT,
          operationType: SyncOperationType.UPDATE,
          entityId: payment.getId(),
          data: this.toJSON(payment),
        });
        
        return payment;
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.PAYMENT,
        operationType: SyncOperationType.UPDATE,
        entityId: payment.getId(),
        data: this.toJSON(payment),
      });
      
      return payment;
    }
  }

  public async delete(id: string): Promise<void> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.delete(COLLECTION_NAME, id);

    if (networkState.canSync()) {
      try {
        await this.onlineRepository.delete(id);
      } catch (error) {
        console.warn('Failed to delete payment on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.PAYMENT,
          operationType: SyncOperationType.DELETE,
          entityId: id,
          data: { id },
        });
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.PAYMENT,
        operationType: SyncOperationType.DELETE,
        entityId: id,
        data: { id },
      });
    }
  }

  private async findAllFromCache(): Promise<Payment[]> {
    const cached = await localDatabase.getAll<any>(COLLECTION_NAME);
    return cached.map(data => this.fromJSON(data));
  }

  private async findByIdFromCache(id: string): Promise<Payment | null> {
    const cached = await localDatabase.get<any>(COLLECTION_NAME, id);
    return cached ? this.fromJSON(cached) : null;
  }

  private async findBySupplierFromCache(supplierId: string): Promise<Payment[]> {
    const allPayments = await localDatabase.getAll<any>(COLLECTION_NAME);
    return allPayments
      .filter(p => p.supplierId === supplierId)
      .map(data => this.fromJSON(data));
  }

  private toJSON(payment: Payment): any {
    return {
      id: payment.getId(),
      supplierId: payment.getSupplierId(),
      amount: payment.getAmount().getAmount(),
      currency: payment.getAmount().getCurrency(),
      type: payment.getType(),
      paymentDate: payment.getPaymentDate().toISOString(),
      reference: payment.getReference(),
      notes: payment.getNotes(),
    };
  }

  private fromJSON(data: any): Payment {
    return Payment.create(
      data.id,
      data.supplierId,
      data.amount,
      data.currency,
      data.type,
      new Date(data.paymentDate),
      data.reference,
      data.notes
    );
  }
}
