'use client';

import { parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import type { FilterDateRangeValue } from '@ui/table/filters/FilterDateRange';
import type { FilterRangeValue } from '@ui/table/filters/FilterRange';

type TFilterObjectValue =
  | string
  | number
  | string[]
  | FilterDateRangeValue
  | FilterRangeValue;

type TFilterApiParams = Record<string, string | number | undefined | string[]>;

export type TUseServerSideFilters<T> = {
  defaultValues?: T;
};

export type TFilterConfig<T> = {
  filters: T;
  onFilterChange: (filterName: keyof T, value: unknown) => void;
  resetFilters: () => void;
  filtersActive: boolean;
};
export const useServerSideFilters = <
  T extends Record<string, TFilterObjectValue>
>(
  props?: TUseServerSideFilters<T>
) => {
  const [filterState, setFilterState] = useState<T>(
    props?.defaultValues ?? ({} as T)
  );

  const filterApiParams = useMemo(
    () => mapFilterStateToApiParams(filterState),
    [filterState]
  );

  const [debouncedFilterApiParams] = useDebounce(filterApiParams, 500);

  return {
    filterConfig: {
      filters: filterState,
      onFilterChange: (filterName: keyof T, value: unknown) => {
        setFilterState((prevState) => ({
          ...prevState,
          [filterName]: value
        }));
      },
      filtersActive: Object.values(filterState).some(Boolean),
      resetFilters: () => setFilterState(props?.defaultValues ?? ({} as T))
    },
    filterApiParams: debouncedFilterApiParams
  };
};

export const mapFilterStateToApiParams = <
  T extends Record<string, TFilterObjectValue>
>(
  filterState: T
) => {
  if (!filterState) return {};

  const params: TFilterApiParams = {};

  for (const key in filterState) {
    const value: TFilterObjectValue = filterState[key];

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      Array.isArray(value)
    ) {
      params[key] = value;
    } else if (value && ('from' in value || 'to' in value)) {
      if (value?.from) {
        const from = parseISO(value?.from);
        params[`${key}From`] = Math.floor(from.getTime() / 1000);
      }

      if (value?.to) {
        const to = parseISO(value?.to);

        params[`${key}To`] = Math.floor(to.getTime() / 1000) + 86399; // 86399 represents the number of seconds in a day minus 1
      }
    } else if (value && ('min' in value || 'max' in value)) {
      params[`${key}Min`] = value?.min;
      params[`${key}Max`] = value?.max;
    }
  }

  return params;
};
