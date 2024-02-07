import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { ComponentProps, FC } from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@utils/cn';

export type CalendarProps = ComponentProps<typeof DayPicker>;

/**
 * Calendar component
 * @param className - The class name of the component.
 * @param classNames - The class names of the component.
 * @param showOutsideDays - Whether to show outside days.
 * @param props - The rest of DayPicker props.
 * @example
 * <Calendar
 *  mode="single"
 *  selected={date}
 *  onSelect={setDate}
 *  className="rounded-md border"
 * />
 */
const Calendar: FC<CalendarProps> = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn(
      'shadow-common-dark rounded border-1.5 border-slate-200 bg-white p-4',
      className
    )}
    classNames={{
      months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
      month: 'space-y-2',
      caption: 'flex justify-center relative items-center pb-2',
      caption_label: 'text-sm font-medium text-slate-800',
      nav: 'space-x-1 flex items-center',
      nav_button:
        'h-6 w-6 bg-transparent p-1 hover:opacity-80 hover:bg-slate-100 rounded transition-colors',
      nav_button_previous: 'absolute left-0',
      nav_button_next: 'absolute right-0',
      table: 'w-full border-collapse spa1ce-y-1',
      head_row: 'flex',
      head_cell: 'text-slate-800 w-8 font-normal text-xs',
      row: 'flex w-full mt-1',
      cell: 'text-center text-xs p-0 relative',
      day: 'h-8 w-8 p-0 font-normal hover:bg-yellow-300 hover:rounded-sm hover:text-slate-800',
      day_selected:
        'bg-yellow-400 text-slate-800 aria-selected:font-medium rounded-sm',
      day_outside: 'text-slate-200',
      day_range_middle:
        'aria-selected:bg-yellow-200 aria-selected:text-slate-800 aria-selected:font-normal',
      day_hidden: 'invisible',
      ...classNames
    }}
    components={{
      IconLeft: () => (
        <ChevronLeftIcon className='stroke-2.5 h-4 w-4 text-slate-800' />
      ),
      IconRight: () => (
        <ChevronRightIcon className='stroke-2.5 h-4 w-4 text-slate-800' />
      )
    }}
    {...props}
  />
);
Calendar.displayName = 'Calendar';

export { Calendar };
