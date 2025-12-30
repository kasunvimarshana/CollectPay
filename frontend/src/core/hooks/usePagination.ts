/**
 * Custom hook for pagination functionality
 */

import { useState, useMemo } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

export interface PaginationResult<T> {
  // Current page data
  currentData: T[];
  // Pagination state
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  // Navigation functions
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPerPage: (perPage: number) => void;
  // Helpers
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const usePagination = <T,>(
  data: T[],
  options: PaginationOptions = {}
): PaginationResult<T> => {
  const { initialPage = 1, initialPerPage = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / perPage);
  const totalItems = data.length;

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, perPage]);

  // Navigation functions
  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSetPerPage = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentData,
    currentPage,
    perPage,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    previousPage,
    setPerPage: handleSetPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};
