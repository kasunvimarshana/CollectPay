/**
 * Payment Store
 * State management for payments using Zustand
 * Enhanced with offline support
 */

import { create } from 'zustand';
import { Payment, PaymentType } from '../../domain/entities/Payment';
import { ApiPaymentRepository } from '../../infrastructure/repositories/ApiPaymentRepository';
import { OfflinePaymentRepository } from '../../infrastructure/repositories/OfflinePaymentRepository';
import { CreatePaymentUseCase } from '../../application/useCases/CreatePaymentUseCase';
import { ListPaymentsUseCase } from '../../application/useCases/ListPaymentsUseCase';

interface PaymentState {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPayments: () => Promise<void>;
  createPayment: (data: { 
    supplierId: string; 
    amount: number; 
    currency: string; 
    type: PaymentType;
    paymentDate: Date;
    reference?: string;
    notes?: string;
  }) => Promise<void>;
  clearError: () => void;
}

// Use offline-aware repository that decorates the API repository
const apiRepository = new ApiPaymentRepository();
const paymentRepository = new OfflinePaymentRepository(apiRepository);
const listPaymentsUseCase = new ListPaymentsUseCase(paymentRepository);
const createPaymentUseCase = new CreatePaymentUseCase(paymentRepository);

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  isLoading: false,
  error: null,

  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const payments = await listPaymentsUseCase.execute();
      set({ payments, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch payments',
        isLoading: false 
      });
    }
  },

  createPayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await createPaymentUseCase.execute(data);
      set((state) => ({ 
        payments: [...state.payments, payment],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create payment',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
