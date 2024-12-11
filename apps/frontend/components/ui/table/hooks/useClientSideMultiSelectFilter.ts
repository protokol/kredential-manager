'use client';

import { useMemo, useState } from 'react';

import type {
  FilterMultiSelectItem,
  FilterMultiSelectValue
} from '@ui/table/filters/FilterMultiSelect';

const useClientSideMultiSelectFilter = <TData>(
  data: TData[] = [],
  items: FilterMultiSelectItem[],
  filterKey: keyof TData
) => {
  const [selectedItems, setSelectedItems] = useState<FilterMultiSelectValue>(
    []
  );

  const filteredList = useMemo(() => {
    if (!selectedItems.length) {
      return data;
    }

    return data.filter((item) => {
      const value = String(item[filterKey]);

      return selectedItems.includes(value);
    });
  }, [data, filterKey, selectedItems]);

  return {
    items: items,
    selectedItems: selectedItems,
    onChange: (values?: FilterMultiSelectValue) =>
      setSelectedItems(values || []),
    filteredList
  };
};

export default useClientSideMultiSelectFilter;
