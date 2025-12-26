import { useState, useEffect, useCallback } from "react";
import { Collection, Product } from "../domain/entities";
import { collectionRepository } from "../services/database/CollectionRepository";
import { CollectionService, CreateCollectionParams } from "../domain/services";
import {
  CollectionSummaryFilter,
  CollectionSummary,
} from "../domain/repositories";

interface UseCollectionsOptions {
  supplierId?: string;
  collectorId?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useCollections(options: UseCollectionsOptions = {}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: Collection[];

      if (options.startDate && options.endDate) {
        result = await collectionRepository.findByDateRange(
          options.startDate,
          options.endDate
        );
      } else if (options.supplierId) {
        result = await collectionRepository.findBySupplier(options.supplierId, {
          orderBy: [{ field: "collectedAt", direction: "desc" }],
        });
      } else if (options.collectorId) {
        result = await collectionRepository.findByCollector(
          options.collectorId,
          {
            orderBy: [{ field: "collectedAt", direction: "desc" }],
          }
        );
      } else {
        result = await collectionRepository.findAll({
          orderBy: [{ field: "collectedAt", direction: "desc" }],
          limit: 50,
        });
      }

      setCollections(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load collections"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    options.supplierId,
    options.collectorId,
    options.startDate,
    options.endDate,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (params: CreateCollectionParams) => {
    const validation = CollectionService.validate({
      supplierId: params.supplierId,
      productId: params.product.id,
      quantity: params.quantity,
      rateAtCollection: params.rate,
    });

    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const collection = CollectionService.createCollection(params);
    const saved = await collectionRepository.save(collection);
    setCollections((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const update = useCallback(async (id: string, data: Partial<Collection>) => {
    const collection = await collectionRepository.update(id, data);
    setCollections((prev) => prev.map((c) => (c.id === id ? collection : c)));
    return collection;
  }, []);

  const confirm = useCallback(
    async (id: string) => {
      return update(id, { status: "confirmed" });
    },
    [update]
  );

  const dispute = useCallback(
    async (id: string, notes: string) => {
      return update(id, { status: "disputed", notes });
    },
    [update]
  );

  const remove = useCallback(async (id: string) => {
    await collectionRepository.softDelete(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    collections,
    isLoading,
    error,
    refresh,
    create,
    update,
    confirm,
    dispute,
    remove,
  };
}

export function useCollectionSummary(filter: CollectionSummaryFilter = {}) {
  const [summary, setSummary] = useState<CollectionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await collectionRepository.getSummary(filter);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load summary");
    } finally {
      setIsLoading(false);
    }
  }, [
    filter.supplierId,
    filter.collectorId,
    filter.productId,
    filter.startDate,
    filter.endDate,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    summary,
    isLoading,
    error,
    refresh,
  };
}
