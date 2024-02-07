import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import type { UseServerSideSortingProps } from '@ui/table/hooks/useServerSideSorting';
import useServerSideTable from '@ui/table/hooks/useServerSideTable';

type ApiParams = {
  offset?: number;
  limit?: number;
  sortBy?: string;
} & Record<string, unknown>;

type TBaseResponse = {
  absoluteCount?: number;
};

type UseServerSideTableDataProps<T> = UseServerSideSortingProps & {
  filterApiParams?: Record<string, unknown>;
  useDataHook: (apiParams: ApiParams) => UseQueryResult<T, unknown>;
};

const useServerSideTableData = <T extends TBaseResponse>({
  filterApiParams,
  useDataHook,
  mappingFn
}: UseServerSideTableDataProps<T>) => {
  /*
   * We're saving absoluteCount in state because the value needs to be used before it is defined.
   * Since useDataHook requires tableConfig.apiParams, we can't change the order of the hooks.
   */
  const [absoluteCount, setAbsoluteCount] = useState<number>(0);
  const tableConfig = useServerSideTable({
    mappingFn,
    absoluteCount
  });

  const { data, ...hookData } = useDataHook({
    ...tableConfig.apiParams,
    ...filterApiParams
  });
  usePaginationReset({
    resetPagination: tableConfig.resetPagination,
    filters: filterApiParams
  });

  useEffect(() => {
    if (typeof data?.absoluteCount == 'number') {
      setAbsoluteCount(data?.absoluteCount);
    }
  }, [data?.absoluteCount]);

  return {
    ...hookData,
    data,
    tableConfig: tableConfig
  };
};

export default useServerSideTableData;

type TUsePaginationReset<T extends object> = {
  resetPagination: () => void;
  filters?: T;
};
const usePaginationReset = <T extends object>({
  resetPagination,
  filters
}: TUsePaginationReset<T>) => {
  useEffect(() => {
    resetPagination();
  }, [filters, resetPagination]);
};
