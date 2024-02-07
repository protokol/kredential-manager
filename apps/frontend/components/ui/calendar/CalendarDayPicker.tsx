import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';

import { cn } from '@utils/cn';
import { formatDate } from '@utils/helpers/dateFormatting';

import { Calendar } from '@ui/calendar/Calendar';
import * as Popover from '@ui/popover/Popover.components';

export type CalendarDayPickerProps = {
  placeholder?: string;
  value?: Date;
  onChange: (date?: Date) => void;
  disabled?: boolean;
};
const CalendarDayPicker: FC<CalendarDayPickerProps> = ({
  placeholder = 'Pick a date',
  value,
  onChange,
  disabled
}) => (
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
        {value ? (
          formatDate(value)
        ) : (
          <span className='text-slate-500 group-disabled:text-slate-300'>
            {placeholder}
          </span>
        )}
      </button>
    </Popover.PopoverTrigger>
    <Popover.PopoverContent align='start' className='z-select'>
      <Calendar
        mode='single'
        selected={value}
        onSelect={onChange}
        initialFocus
      />
    </Popover.PopoverContent>
  </Popover.PopoverRoot>
);

export default CalendarDayPicker;
