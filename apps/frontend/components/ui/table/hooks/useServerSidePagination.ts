'use client';

import { useCallback, useMemo, useState } from 'react';

import type { TablePaginationConfig } from '@ui/table/TablePaginationFooter';

type PaginationState = {
  currentPage: number;
  resultsPerPage: number;
};
const defaultPaginationState = { currentPage: 1, resultsPerPage: 10 };

export type UseServerSidePaginationProps = {
  totalItems?: number;
};

type UseServerSidePaginationReturn = {
  paginationApiConfig: {
    page: number;
    size: number;
  };
  paginationConfig: TablePaginationConfig;
  resetPagination: () => void;
};

const useServerSidePagination = ({
  totalItems
}: UseServerSidePaginationProps): UseServerSidePaginationReturn => {
  const [paginationState, setPaginationState] = useState<PaginationState>(
    defaultPaginationState
  );

  const resetPagination = useCallback(() => {
    setPaginationState((prevState) => ({
      ...prevState,
      currentPage: 1
    }));
  }, []);

  return useMemo(
    () => ({
      resetPagination,
      paginationApiConfig: {
        page: paginationState.currentPage - 1,
        size: paginationState.resultsPerPage
      },
      paginationConfig: {
        totalResults: totalItems ?? 0,
        resultsPerPage: paginationState.resultsPerPage,
        currentPage: paginationState.currentPage,
        setResultsPerPage: (resultsPerPage: number) => {
          setPaginationState((state) => ({
            ...state,
            resultsPerPage,
            currentPage: 1
          }));
        },
        setCurrentPage: (currentPage: number) =>
          setPaginationState((state) => ({ ...state, currentPage }))
      }
    }),
    [
      totalItems,
      paginationState.currentPage,
      paginationState.resultsPerPage,
      resetPagination
    ]
  );
};

export default useServerSidePagination;
