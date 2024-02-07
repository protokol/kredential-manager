'use client';

import { useMemo, useState } from 'react';

import { isUndefined } from '@utils/helpers/validation';

import type { FilterRangeValue } from '@components/ui/table/filters/FilterRange';

const useClientSideRangeFilter = <TData>(
  data: TData[] = [],
  filterKey: keyof TData
) => {
  const [filterValue, setFilterValue] = useState<
    FilterRangeValue | undefined
  >();

  const filteredList = useMemo(() => {
    if (isUndefined(filterValue?.min) && isUndefined(filterValue?.max)) {
      return data;
    }
    const minValue = filterValue?.min;
    const maxValue = filterValue?.max;

    if (minValue && isUndefined(maxValue)) {
      return data.filter((item) => {
        const value = item[filterKey];

        if (Array.isArray(value)) {
          return value.length >= minValue;
        }
        return Number(item[filterKey]) >= minValue;
      });
    }

    if (isUndefined(minValue) && maxValue) {
      return data.filter((item) => {
        const value = item[filterKey];
        if (Array.isArray(value)) {
          return value.length <= maxValue;
        }
        return Number(item[filterKey]) <= maxValue;
      });
    }

    if (!isUndefined(maxValue) && !isUndefined(minValue)) {
      return data.filter((item) => {
        const value = item[filterKey];
        if (Array.isArray(value)) {
          return (
            value.length >= (minValue as number) &&
            value.length <= (maxValue as number)
          );
        }
        return (
          Number(value) >= (minValue as number) &&
          Number(value) <= (maxValue as number)
        );
      });
    }
    return data;
  }, [data, filterKey, filterValue]);

  return {
    minValue: filterValue?.min,
    maxValue: filterValue?.max,
    onChange: (value: FilterRangeValue | undefined) => setFilterValue(value),
    filteredList
  };
};

export default useClientSideRangeFilter;
