'use client';

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import * as SelectPrimitive from '@radix-ui/react-select';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'group flex w-full items-center justify-between gap-2 rounded border-1.5 border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800',
      'ring-slate-200 ring-offset-white focus:outline-none focus:ring-2 focus:ring-offset-2',
      'data-[placeholder]:text-slate-500 disabled:data-[placeholder]:text-slate-500',
      'hover:border-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className='h-4 w-4 flex-shrink-0 stroke-2 text-slate-500 transition group-data-[disabled]:text-slate-400' />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative max-h-60 min-w-32 overflow-y-auto rounded bg-white',
        'z-[100]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        {
          'data-[side=bottom]:translate-y-2 data-[side=left]:-translate-x-2 data-[side=right]:translate-x-2 data-[side=top]:-translate-y-2':
            position === 'popper'
        },
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn({
          'h-radix-select-trigger min-w-radix-select-trigger w-full overflow-hidden rounded border-1.5 border-slate-200':
            position === 'popper'
        })}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'group relative flex w-full select-none items-center py-2 pl-4 pr-8 text-sm text-slate-800 outline-none hover:cursor-pointer',
      'hover:bg-slate-50 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:bg-slate-50 data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className='absolute right-2 mr-2 flex h-4 w-4 items-center justify-center stroke-2'>
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className='h-4 w-4 stroke-2 text-slate-500 group-data-[disabled]:text-slate-300' />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-slate-300', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select as SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator
};
