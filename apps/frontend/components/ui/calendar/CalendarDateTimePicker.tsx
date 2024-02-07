'use client';

import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';
import { useCallback, useMemo } from 'react';

import { cn } from '@utils/cn';
import { formatDateTimeWithTimezone } from '@utils/helpers/dateFormatting';

import Label from '@ui/Label';
import Select from '@ui/Select';
import { Calendar } from '@ui/calendar/Calendar';
import * as Popover from '@ui/popover/Popover.components';

export type CalendarDateTimePickerProps = {
  placeholder?: string;
  value?: Date;
  onChange?: (date?: Date) => void;
  disabled?: boolean;
};
const CalendarDateTimePicker: FC<CalendarDateTimePickerProps> = ({
  placeholder = 'Pick a date and time',
  value,
  onChange,
  disabled
}) => {
  const time = useMemo(() => {
    if (!value) return undefined;
    const hours = value.getHours();

    const formattedHours = String(hours).padStart(2, '0');

    return `${formattedHours}:00`;
  }, [value]);

  const timeZone = useMemo(() => {
    if (!value) return undefined;
    const timezoneOffsetInMinutes = value.getTimezoneOffset();
    const hoursOffset = Math.floor(Math.abs(timezoneOffsetInMinutes) / 60);
    const minutesOffset = Math.abs(timezoneOffsetInMinutes) % 60;

    const direction = timezoneOffsetInMinutes > 0 ? '-' : '+';
    const formattedHours = String(hoursOffset).padStart(2, '0');
    const formattedMinutes = String(minutesOffset).padStart(2, '0');
    return `${direction}${formattedHours}:${formattedMinutes}`;
  }, [value]);

  const onTimeChange = useCallback(
    (time: string) => {
      if (!value) return;
      const [hours, minutes] = time.split(':');
      const date = new Date(value);

      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      onChange?.(date);
    },
    [onChange, value]
  );

  const onTimeZoneChange = useCallback(
    (timeZone: string) => {
      if (!value) return;
      const [hours, minutes] = timeZone.split(':');
      const date = new Date(value);

      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      onChange?.(date);
    },
    [onChange, value]
  );

  const onDateChange = useCallback(
    (date?: Date) => {
      if (!value || !date) {
        return onChange?.(date);
      }

      const newDate = new Date(date);
      newDate.setHours(value.getHours());
      newDate.setMinutes(value.getMinutes());
      onChange?.(newDate);
    },
    [onChange, value]
  );

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
          {value ? (
            formatDateTimeWithTimezone(value)
          ) : (
            <span className='text-slate-500 group-disabled:text-slate-300'>
              {placeholder}
            </span>
          )}
        </button>
      </Popover.PopoverTrigger>
      <Popover.PopoverContent
        align='start'
        className='z-select space-y-4 rounded border-1.5 border-slate-200 bg-white p-4'
      >
        <Calendar
          className='border-none p-0'
          mode='single'
          selected={value}
          onSelect={onDateChange}
          initialFocus
        />
        <div className='flex flex-col gap-2'>
          <Label>Time</Label>
          <Select
            items={TIMES}
            value={time}
            onValueChange={onTimeChange}
            placeholder='Select time'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label>Timezone</Label>
          <Select
            items={ZONES}
            value={timeZone}
            placeholder='Select timezone'
            onValueChange={onTimeZoneChange}
          />
        </div>
      </Popover.PopoverContent>
    </Popover.PopoverRoot>
  );
};

export default CalendarDateTimePicker;

const formatZoneNumber = (zone: number) => {
  const hour =
    `${Math.abs(zone)}`.length === 1
      ? `0${Math.abs(zone)}`
      : `${Math.abs(zone)}`;
  return `${zone >= 0 ? '+' : '-'}${hour}:00`;
};

export const range = (start: number, end: number, step = 1): number[] => {
  const size = start * -1 + end + 1;
  return [...Array(size)].map((_, idx) => idx - 1 + start + step);
};

const ZONES = range(-11, 14).map((item) => ({
  value: formatZoneNumber(item),
  label: item ? formatZoneNumber(item) : 'UTC'
}));

const TIMES = [
  { label: '12:00 AM', value: '00:00' },
  { label: '01:00 AM', value: '01:00' },
  { label: '02:00 AM', value: '02:00' },
  { label: '03:00 AM', value: '03:00' },
  { label: '04:00 AM', value: '04:00' },
  { label: '05:00 AM', value: '05:00' },
  { label: '06:00 AM', value: '06:00' },
  { label: '07:00 AM', value: '07:00' },
  { label: '08:00 AM', value: '08:00' },
  { label: '09:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '01:00 PM', value: '13:00' },
  { label: '02:00 PM', value: '14:00' },
  { label: '03:00 PM', value: '15:00' },
  { label: '04:00 PM', value: '16:00' },
  { label: '05:00 PM', value: '17:00' },
  { label: '06:00 PM', value: '18:00' },
  { label: '07:00 PM', value: '19:00' },
  { label: '08:00 PM', value: '20:00' },
  { label: '09:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' }
];
