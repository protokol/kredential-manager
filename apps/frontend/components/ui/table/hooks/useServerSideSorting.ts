import type { SortingState } from '@tanstack/react-table';
import type { OnChangeFn } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { mapTableSortToKey } from '@ui/table/utils/tableSort';

export type TableSortConfig = {
  sorting?: SortingState;
  setSorting?: OnChangeFn<SortingState>;
};

export type UseServerSideSortingProps = {
  mappingFn?: (sortState: SortingState) => string | undefined;
};
const useServerSideSorting = ({
  mappingFn
}: UseServerSideSortingProps = {}) => {
  const [sortState, setSortState] = useState<SortingState>([]);

  return useMemo(
    () => ({
      sortApiConfig: {
        sortBy: mappingFn
          ? mappingFn?.(sortState)
          : mapTableSortToKey(sortState)
      },
      sortConfig: {
        sorting: sortState,
        setSorting: setSortState
      }
    }),
    [sortState, mappingFn]
  );
};

export default useServerSideSorting;
