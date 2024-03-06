'use client';

import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

import * as Popover from '@ui/popover/Popover.components';

export type FilterWrapperProps = PropsWithChildren<{
  title: string;
  disabled?: boolean;
  active?: boolean;
  clear?: () => void;
  onClose?: () => void;
  contentClassName?: string;
}>;
const FilterWrapper: FC<FilterWrapperProps> = ({
  title,
  disabled,
  active,
  clear,
  onClose,
  children,
  contentClassName
}) => (
  <Popover.PopoverRoot
    onOpenChange={(open) => {
      if (!open) {
        onClose?.();
      }
    }}
  >
    <Popover.PopoverTrigger asChild>
      <FilterButton disabled={disabled} active={active}>
        <span className='flex-wrap'>{title}</span>
        {!active && (
          <ChevronDownIcon className='h-5 w-5 flex-shrink-0 stroke-2 text-slate-800 transition group-disabled:text-slate-500 group-data-[state=open]:rotate-180' />
        )}
        {active && (
          <div
            className='rounded hover:bg-slate-200'
            onClick={(e) => {
              e.stopPropagation();
              clear?.();
            }}
          >
            <XMarkIcon className='h-5 w-5 flex-shrink-0 stroke-2 text-slate-800 group-disabled:text-slate-500' />
          </div>
        )}
      </FilterButton>
    </Popover.PopoverTrigger>
    <Popover.PopoverContent
      asChild
      align='start'
      className={cn(
        'z-select max-h-80 min-w-32 max-w-48 overflow-y-auto border-1.5 border-slate-200 bg-white',
        contentClassName
      )}
    >
      {children}
    </Popover.PopoverContent>
  </Popover.PopoverRoot>
);

export default FilterWrapper;

type FilterButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ disabled, active, className, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'group flex w-auto min-w-32 items-center justify-between gap-2 rounded border-1.5 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800',
        'ring-slate-200 ring-offset-white focus:outline-none focus:ring-2 focus:ring-offset-2',
        'hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500',
        {
          'border-slate-800 bg-slate-50': active && !disabled
        },
        className
      )}
      {...props}
    />
  )
);

FilterButton.displayName = 'FilterButton';
