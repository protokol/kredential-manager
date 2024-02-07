'use client';

import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';

import type { FilterDateRangeValue } from '@components/ui/table/filters/FilterDateRange';

const daysDifference = (from: number, to: number) =>
  differenceInCalendarDays(new Date(from * 1000), new Date(to * 1000));

const useClientSideDateRangeFilter = <TData>(
  data: TData[] = [],
  filterKey: keyof TData
) => {
  const [filterValue, setFilterValue] = useState<
    FilterDateRangeValue | undefined
  >();

  const filteredList = useMemo(() => {
    if (!filterValue?.from && !filterValue?.to) {
      return data;
    }
    const { from, to } = filterValue;
    const fromDate = Math.floor(parseISO(from || '').getTime() / 1000);

    const toDate = to
      ? Math.floor(parseISO(to || '').getTime() / 1000 + 86399)
      : 0;

    if (from && !to) {
      return data.filter((item) => {
        const value = Number(item[filterKey]);

        return daysDifference(value, fromDate) >= 0;
      });
    }

    if (from && to) {
      return data.filter((item) => {
        const value = Number(item[filterKey]);

        return (
          daysDifference(value, fromDate) >= 0 &&
          daysDifference(value, toDate) <= 0
        );
      });
    }

    return data;
  }, [data, filterKey, filterValue]);

  return {
    value: filterValue,
    onChange: (value: FilterDateRangeValue | undefined) =>
      setFilterValue(value),
    filteredList
  };
};

export default useClientSideDateRangeFilter;
