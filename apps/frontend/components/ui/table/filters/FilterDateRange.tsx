'use client';

import type { FC } from 'react';

import { cn } from '@utils/cn';

import { Calendar } from '@ui/calendar/Calendar';
import type { FilterWrapperProps } from '@ui/table/filters/FilterWrapper';
import FilterWrapper from '@ui/table/filters/FilterWrapper';

export type FilterDateRangeValue = { from?: string; to?: string };

type FilterDateRangeProps = FilterWrapperProps & {
  from?: FilterDateRangeValue['from'];
  to?: FilterDateRangeValue['to'];
  onChange: (value?: FilterDateRangeValue) => void;
};
const FilterDateRange: FC<FilterDateRangeProps> = ({
  from,
  to,
  onChange,
  ...wrapperProps
}) => (
  <FilterWrapper
    {...wrapperProps}
    contentClassName={cn('max-w-none', wrapperProps.contentClassName)}
    clear={() => {
      onChange(undefined);
    }}
  >
    <div className='p-4'>
      <Calendar
        mode='range'
        className='border-none p-0'
        selected={{
          from: from ? new Date(from) : undefined,
          to: to ? new Date(to) : undefined
        }}
        onSelect={(value) =>
          onChange({
            from: value?.from?.toISOString(),
            to: value?.to?.toISOString()
          })
        }
      />
    </div>
  </FilterWrapper>
);

export default FilterDateRange;
