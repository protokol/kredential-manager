import { CheckIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { cn } from '@utils/cn';

import Input from '@ui/Input';
import type { SelectMenuItem } from '@ui/Select';
import type { FilterWrapperProps } from '@ui/table/filters/FilterWrapper';
import FilterWrapper from '@ui/table/filters/FilterWrapper';

export type FilterSelectItem = SelectMenuItem;

export type FilterSelectValue = string;

export type FilterSelectProps = FilterWrapperProps & {
  items: FilterSelectItem[];
  onChange: (value?: string) => void;
  selectedItem?: FilterSelectValue;
};
const FilterSelect: FC<FilterSelectProps> = ({
  items,
  onChange,
  selectedItem,
  ...wrapperProps
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    if (!searchQuery) {
      return items;
    }

    return items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleOnChange = (value: FilterSelectValue) => {
    const valueSelected = selectedItem === value;
    if (valueSelected) {
      onChange(undefined);
      return;
    }

    onChange(value);
  };

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
          <div className='text-gray-500 p-4 text-center text-sm'>
            No items found.
          </div>
        )}
        <div>
          {filteredItems.map((item: FilterSelectItem) => {
            const isSelected = selectedItem === item.value;

            return (
              <button
                title={item.label}
                disabled={item?.disabled}
                onClick={() => handleOnChange(item.value)}
                key={item.value}
                className={cn(
                  'group relative block w-full min-w-0 select-none truncate py-2 pl-8 pr-4 text-left text-sm text-slate-800 outline-none hover:cursor-pointer',
                  'hover:bg-slate-50 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:bg-slate-50 data-[disabled]:opacity-50'
                )}
              >
                {isSelected && (
                  <span className='absolute left-2 inline-flex h-5 w-5 items-center justify-center stroke-2'>
                    <CheckIcon className='h-5 w-5 stroke-2 text-slate-500 group-data-[disabled]:text-slate-300' />
                  </span>
                )}

                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </FilterWrapper>
  );
};

export default FilterSelect;
