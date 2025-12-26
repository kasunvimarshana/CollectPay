import { useState, useEffect, useCallback } from "react";
import { Payment } from "../domain/entities";
import { paymentRepository } from "../services/database/PaymentRepository";
import { PaymentService, CreatePaymentParams } from "../domain/services";
import { SettlementCalculation } from "../domain/repositories";

interface UsePaymentsOptions {
  supplierId?: string;
  status?: string;
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: Payment[];

      if (options.supplierId) {
        result = await paymentRepository.findBySupplier(options.supplierId, {
          orderBy: [{ field: "createdAt", direction: "desc" }],
        });
      } else {
        result = await paymentRepository.findAll({
          where: options.status ? { status: options.status } : undefined,
          orderBy: [{ field: "createdAt", direction: "desc" }],
          limit: 50,
        });
      }

      setPayments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  }, [options.supplierId, options.status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (params: CreatePaymentParams) => {
    const validation = PaymentService.validate({
      supplierId: params.supplierId,
      amount: params.amount,
      paymentType: params.paymentType,
      paymentMethod: params.paymentMethod,
    });

    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const payment = PaymentService.createPayment(params);
    const saved = await paymentRepository.save(payment);
    setPayments((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const update = useCallback(async (id: string, data: Partial<Payment>) => {
    const payment = await paymentRepository.update(id, data);
    setPayments((prev) => prev.map((p) => (p.id === id ? payment : p)));
    return payment;
  }, []);

  const complete = useCallback(
    async (id: string) => {
      return update(id, { status: "completed", paidAt: new Date() });
    },
    [update]
  );

  const cancel = useCallback(
    async (id: string) => {
      return update(id, { status: "cancelled" });
    },
    [update]
  );

  const remove = useCallback(async (id: string) => {
    await paymentRepository.softDelete(id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    payments,
    isLoading,
    error,
    refresh,
    create,
    update,
    complete,
    cancel,
    remove,
  };
}

export function useSettlementCalculation(
  supplierId: string,
  startDate: Date,
  endDate: Date
) {
  const [calculation, setCalculation] = useState<SettlementCalculation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supplierId) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await paymentRepository.calculateSettlement(
        supplierId,
        startDate,
        endDate
      );
      setCalculation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to calculate settlement"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supplierId, startDate, endDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    calculation,
    isLoading,
    error,
    refresh,
  };
}
