'use client';

import type { FC } from 'react';
import { memo, useMemo, useState } from 'react';

import Checkbox from '@ui/Checkbox';
import Input from '@ui/Input';
import type { FilterWrapperProps } from '@ui/table/filters/FilterWrapper';
import FilterWrapper from '@ui/table/filters/FilterWrapper';

export type FilterMultiSelectItem = {
  value: string;
  label: string;
};

export type FilterMultiSelectValue = string[]; // value of selected items

export type FilterMultiSelectProps = FilterWrapperProps & {
  items: FilterMultiSelectItem[];
  onChange: (value?: FilterMultiSelectValue) => void;
  selectedItems?: FilterMultiSelectValue;
  filterByEmptyField?: boolean;
};
const FilterMultiSelect: FC<FilterMultiSelectProps> = ({
  items,
  onChange,
  selectedItems = [],
  filterByEmptyField,
  ...wrapperProps
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleOnChange = (value: string) => {
    const valueExists = selectedItems.includes(value);

    const newSelectedItems = valueExists
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];

    onChange(newSelectedItems);
  };

  const filteredItems = useMemo(() => {
    const itemsWithEmptyField = filterByEmptyField
      ? [
          { value: '--empty', label: `No ${wrapperProps.title.toLowerCase()}` },
          ...items
        ]
      : items;
    if (!searchQuery) {
      return itemsWithEmptyField;
    }

    return itemsWithEmptyField.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filterByEmptyField, items, searchQuery, wrapperProps.title]);

  return (
    <FilterWrapper
      {...wrapperProps}
      onClose={() => {
        setSearchQuery('');
      }}
      clear={() => {
        onChange(undefined);
      }}
    >
      <div>
        {items.length >= 10 && (
          <Input
            className='mb-1 rounded-none border-0 border-b-1.5 focus-visible:ring-0'
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        {!filteredItems.length && (
          <div className='p-4 text-center text-sm text-slate-500'>
            No items found.
          </div>
        )}
        {filteredItems.map((item) => (
          <label
            htmlFor={item.value}
            className='flex gap-2 px-3 py-2 hover:bg-slate-50 active:bg-slate-50'
            key={item.value}
          >
            <Checkbox
              id={item.value}
              value={item.value}
              checked={selectedItems.includes(item.value)}
              onCheckedChange={() => {
                handleOnChange(item.value);
              }}
            />
            <div className='truncate text-sm font-medium text-slate-800'>
              {item.label}
            </div>
          </label>
        ))}
      </div>
    </FilterWrapper>
  );
};

export default memo(FilterMultiSelect);
