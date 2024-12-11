'use client';

import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';
import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@utils/cn';
import { formatDate } from '@utils/helpers/dateFormatting';

import { Calendar } from '@ui/calendar/Calendar';
import * as Popover from '@ui/popover/Popover.components';

export type CalendarDateRangePickerProps = {
  placeholder?: string;
  value?: DateRange;
  onChange: (date?: DateRange) => void;
  disabled?: boolean;
};
const CalendarDateRangePicker: FC<CalendarDateRangePickerProps> = ({
  placeholder = 'Pick a date',
  value,
  onChange,
  disabled
}) => {
  const displayValue = useMemo(() => {
    if (value?.from && value?.to) {
      return (
        formatDate(new Date(value.from)) +
        ' - ' +
        formatDate(new Date(value.to))
      );
    }

    if (value?.to) {
      return formatDate(new Date(value.to));
    }

    return (
      <span className='text-slate-500 group-disabled:text-slate-300'>
        {placeholder}
      </span>
    );
  }, [placeholder, value?.from, value?.to]);

  return (
    <Popover.PopoverRoot>
      <Popover.PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            'group flex w-full items-center gap-2 rounded border-1.5 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800',
            'ring-slate-200 ring-offset-white focus:outline-none focus:ring-2 focus:ring-offset-2',
            'hover:bg-gray-100 disabled:bg-gray-50 disabled:cursor-not-allowed'
          )}
        >
          <CalendarDaysIcon className='h-4 w-4 flex-shrink-0 text-slate-800 group-disabled:text-slate-300' />
          {displayValue}
        </button>
      </Popover.PopoverTrigger>
      <Popover.PopoverContent align='start' className='z-select'>
        <Calendar
          mode='range'
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </Popover.PopoverContent>
    </Popover.PopoverRoot>
  );
};

export default CalendarDateRangePicker;
