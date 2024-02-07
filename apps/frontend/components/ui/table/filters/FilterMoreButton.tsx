import { PlusIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';

import Checkbox from '@ui/Checkbox';
import * as Popover from '@ui/popover/Popover.components';
import type { FilterMultiSelectProps } from '@ui/table/filters/FilterMultiSelect';
import { FilterButton } from '@ui/table/filters/FilterWrapper';

const FilterMoreButton: FC<FilterMultiSelectProps> = ({
  title,
  items = [],
  onChange,
  selectedItems = [],
  onClose,
  disabled
}) => {
  const handleOnChange = (value: string) => {
    const valueExists = selectedItems.includes(value);

    const newSelectedItems = valueExists
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];

    onChange(newSelectedItems);
  };

  return (
    <Popover.PopoverRoot
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
      }}
    >
      <Popover.PopoverTrigger asChild>
        <FilterButton disabled={disabled}>
          <span>{title}</span>
          <PlusIcon className='h-5 w-5 flex-shrink-0 stroke-2' />
        </FilterButton>
      </Popover.PopoverTrigger>
      <Popover.PopoverContent
        asChild
        align='start'
        className='z-select max-h-80 max-w-48 overflow-y-auto border-1.5 border-slate-200 bg-white'
      >
        <div>
          {items.map((item) => (
            <label
              htmlFor={item.value}
              className='flex gap-2 px-3 py-2 hover:bg-slate-50 active:bg-slate-50'
              key={item.value}
            >
              <Checkbox
                id={item.value}
                value={item.value}
                checked={selectedItems?.includes(item.value)}
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
      </Popover.PopoverContent>
    </Popover.PopoverRoot>
  );
};

export default FilterMoreButton;
