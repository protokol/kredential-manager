import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import type { UseServerSidePaginationProps } from '@ui/table/hooks/useServerSidePagination';
import useServerSidePagination from '@ui/table/hooks/useServerSidePagination';
import type { UseServerSideSortingProps } from '@ui/table/hooks/useServerSideSorting';
import useServerSideSorting from '@ui/table/hooks/useServerSideSorting';

type UseServerSideTableProps = UseServerSidePaginationProps &
  UseServerSideSortingProps & {
    apiParamList?: Record<string, unknown>;
  };
const useServerSideTable = ({
  totalItems,
  mappingFn,
  apiParamList
}: UseServerSideTableProps) => {
  const { paginationApiConfig, paginationConfig, resetPagination } =
    useServerSidePagination({
      totalItems
    });
  const { sortApiConfig, sortConfig } = useServerSideSorting({
    mappingFn
  });

  const [apiParams] = useDebounce(
    useMemo(
      () => ({
        ...apiParamList,
        ...sortApiConfig,
        ...paginationApiConfig
      }),
      [apiParamList, paginationApiConfig, sortApiConfig]
    ),
    500
  );

  return {
    apiParams,
    sortConfig,
    paginationConfig,
    resetPagination
  };
};

export default useServerSideTable;
