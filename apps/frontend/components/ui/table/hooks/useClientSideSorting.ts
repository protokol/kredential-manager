'use client';

import type { SortingState } from '@tanstack/react-table';
import { useState } from 'react';

import { sortByKey } from '@utils/helpers/sorting';

const useClientSideSorting = <TData>(
  data: TData[] = [],
  defaultSortState: SortingState = []
) => {
  const [sortState, setSortState] = useState<SortingState>(defaultSortState);
  const sortId: keyof TData | unknown = sortState?.find(() => true)?.id;
  const sortDesc: boolean = sortState?.find(() => true)?.desc || false;

  if (!sortId)
    return {
      sorting: sortState,
      setSorting: setSortState,
      sortedList: data
    };

  return {
    sorting: sortState,
    setSorting: setSortState,
    sortedList: sortByKey(
      data,
      sortId as keyof TData,
      sortDesc ? 'desc' : 'asc'
    )
  };
};

export default useClientSideSorting;
