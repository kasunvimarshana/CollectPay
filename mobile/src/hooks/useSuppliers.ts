import { useState, useEffect, useCallback } from "react";
import { Supplier } from "../domain/entities";
import { supplierRepository } from "../services/database/SupplierRepository";

interface UseSuppliersOptions {
  region?: string;
  collectorId?: string;
  autoRefresh?: boolean;
}

export function useSuppliers(options: UseSuppliersOptions = {}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: Supplier[];

      if (options.region) {
        result = await supplierRepository.findByRegion(options.region);
      } else if (options.collectorId) {
        result = await supplierRepository.findByCollector(options.collectorId);
      } else {
        result = await supplierRepository.findAll({
          orderBy: [{ field: "name", direction: "asc" }],
        });
      }

      setSuppliers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
  }, [options.region, options.collectorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (data: Partial<Supplier>) => {
    const supplier = await supplierRepository.save(data);
    setSuppliers((prev) => [...prev, supplier]);
    return supplier;
  }, []);

  const update = useCallback(async (id: string, data: Partial<Supplier>) => {
    const supplier = await supplierRepository.update(id, data);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? supplier : s)));
    return supplier;
  }, []);

  const remove = useCallback(async (id: string) => {
    await supplierRepository.softDelete(id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getBalance = useCallback(async (id: string) => {
    return supplierRepository.calculateBalance(id);
  }, []);

  return {
    suppliers,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    getBalance,
  };
}

export function useSupplier(id: string) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await supplierRepository.findById(id);
      setSupplier(result);

      if (result) {
        const bal = await supplierRepository.calculateBalance(id);
        setBalance(bal);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load supplier");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    supplier,
    balance,
    isLoading,
    error,
    refresh,
  };
}
