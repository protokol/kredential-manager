'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';

type TPaginationContext = {
  currentPage: number;
  resultsPerPage: number;
};

interface PaginationContextProps {
  paginationState: TPaginationContext;
  updatePaginationState: (newState: Partial<TPaginationContext>) => void;
  pendingPaginationState: TPaginationContext;
  updatePendingPaginationState: (newState: Partial<TPaginationContext>) => void;
}

const PaginationContext = createContext<PaginationContextProps | undefined>(
  undefined
);

export const PaginationProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [paginationState, setPaginationState] = useState<TPaginationContext>({
    currentPage: 1,
    resultsPerPage: 10
  });

  const [pendingPaginationState, setPendingPaginationState] =
    useState<TPaginationContext>({
      currentPage: 1,
      resultsPerPage: 10
    });

  const updatePaginationState = (newState: Partial<TPaginationContext>) => {
    setPaginationState((prevState) => ({
      ...prevState,
      ...newState
    }));
  };

  const updatePendingPaginationState = (
    newState: Partial<TPaginationContext>
  ) => {
    setPendingPaginationState((prevState) => ({
      ...prevState,
      ...newState
    }));
  };

  return (
    <PaginationContext.Provider
      value={{
        paginationState,
        updatePaginationState,
        pendingPaginationState,
        updatePendingPaginationState
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination = (): PaginationContextProps => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePagination must be used within a PaginationProvider');
  }
  return context;
};
