'use client';

import { useEffect, useState } from 'react';

const useClientSidePagination = <T extends object>(
  data: T[] = [],
  itemsPerPage: number = 10
) => {
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    resultsPerPage: itemsPerPage
  });

  const startIndex =
    (paginationState.currentPage - 1) * paginationState.resultsPerPage;
  const endIndex = startIndex + paginationState.resultsPerPage;

  const slicedData = data?.slice(startIndex, endIndex) || [];

  useEffect(() => {
    setPaginationState((prevState) => ({
      ...prevState,
      currentPage: 1
    }));
  }, [data.length]);

  return {
    totalResults: data.length,
    currentPage: paginationState.currentPage,
    setCurrentPage: (pageNumber: number) =>
      setPaginationState((prevState) => ({
        ...prevState,
        currentPage: pageNumber
      })),
    resultsPerPage: paginationState.resultsPerPage,
    setResultsPerPage: (resultsPerPage: number) =>
      setPaginationState({
        currentPage: 1,
        resultsPerPage
      }),
    paginatedList: slicedData
  };
};

export default useClientSidePagination;
