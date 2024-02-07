'use client';

import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

const useClientSideSearchFilter = <TData>(
  data: TData[] = [],
  searchKeys: (keyof TData)[]
) => {
  const [filterValue, setFilterValue] = useState('');

  const [debouncedFilterValue] = useDebounce(filterValue, 500);

  const filteredList = useMemo(() => {
    if (!debouncedFilterValue) {
      return data;
    }

    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === 'string') {
          return value
            .toLowerCase()
            .includes(debouncedFilterValue.toLowerCase());
        }

        if (typeof value === 'number') {
          return value.toString().includes(debouncedFilterValue);
        }

        return false;
      })
    );
  }, [data, debouncedFilterValue, searchKeys]);

  return {
    value: filterValue,
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setFilterValue(e.target.value),
    filteredList,
    resetFilter: () => setFilterValue('')
  };
};

export default useClientSideSearchFilter;
