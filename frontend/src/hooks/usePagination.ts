import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  perPage: number;
  hasMore: boolean;
  isLoadingMore: boolean;
}

interface UsePaginationOptions {
  initialPerPage?: number;
}

interface UsePaginationReturn<T> {
  items: T[];
  page: number;
  perPage: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  setItems: (items: T[]) => void;
  appendItems: (newItems: T[]) => void;
  setPerPage: (perPage: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoadingMore: (isLoading: boolean) => void;
  loadMore: () => void;
  reset: () => void;
}

/**
 * Custom hook for managing pagination state
 * Supports infinite scroll and page size selection
 */
export function usePagination<T>(
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPerPage = 25 } = options;
  
  const [items, setItemsState] = useState<T[]>([]);
  const [state, setState] = useState<PaginationState>({
    page: 1,
    perPage: initialPerPage,
    hasMore: true,
    isLoadingMore: false,
  });

  const setItems = useCallback((newItems: T[]) => {
    setItemsState(newItems);
    setState((prev) => ({
      ...prev,
      page: 1,
      hasMore: newItems.length >= prev.perPage,
    }));
  }, []);

  const appendItems = useCallback((newItems: T[]) => {
    setItemsState((prev) => [...prev, ...newItems]);
    setState((prev) => ({
      ...prev,
      page: prev.page + 1,
      hasMore: newItems.length >= prev.perPage,
      isLoadingMore: false,
    }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setState((prev) => ({
      ...prev,
      perPage,
    }));
  }, []);

  const setHasMore = useCallback((hasMore: boolean) => {
    setState((prev) => ({
      ...prev,
      hasMore,
    }));
  }, []);

  const setIsLoadingMore = useCallback((isLoading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoadingMore: isLoading,
    }));
  }, []);

  const loadMore = useCallback(() => {
    if (!state.isLoadingMore && state.hasMore) {
      setState((prev) => ({
        ...prev,
        isLoadingMore: true,
      }));
    }
  }, [state.isLoadingMore, state.hasMore]);

  const reset = useCallback(() => {
    setItemsState([]);
    setState({
      page: 1,
      perPage: initialPerPage,
      hasMore: true,
      isLoadingMore: false,
    });
  }, [initialPerPage]);

  return {
    items,
    page: state.page,
    perPage: state.perPage,
    hasMore: state.hasMore,
    isLoadingMore: state.isLoadingMore,
    setItems,
    appendItems,
    setPerPage,
    setHasMore,
    setIsLoadingMore,
    loadMore,
    reset,
  };
}
