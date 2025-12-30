/**
 * Custom hook for sorting functionality
 */

import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface SortResult<T> {
  sortedData: T[];
  sortConfig: SortConfig<T>;
  requestSort: (key: keyof T) => void;
  getSortDirection: (key: keyof T) => SortDirection;
}

export const useSort = <T,>(data: T[]): SortResult<T> => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: null,
    direction: null,
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });

    return sorted;
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key: direction ? key : null, direction });
  };

  const getSortDirection = (key: keyof T): SortDirection => {
    if (sortConfig.key === key) {
      return sortConfig.direction;
    }
    return null;
  };

  return {
    sortedData,
    sortConfig,
    requestSort,
    getSortDirection,
  };
};
