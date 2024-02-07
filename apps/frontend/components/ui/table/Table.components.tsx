import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import type { Column } from '@tanstack/react-table';
import type {
  HTMLAttributes,
  SVGProps,
  TdHTMLAttributes,
  ThHTMLAttributes
} from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

import PinLeftIcon from '@ui/icons/PinLeftIcon';
import PinRightIcon from '@ui/icons/PinRightIcon';
import * as Popover from '@ui/popover/Popover.components';

const TableComponents = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className='table-scrollbar w-full overflow-auto'>
    <table
      ref={ref}
      className={cn(
        'border-1 w-full caption-bottom rounded-md border-slate-200',
        className
      )}
      {...props}
    />
  </div>
));
TableComponents.displayName = 'Table';

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('text-sm text-slate-800', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-off-white font-medium', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b border-slate-200 transition-colors', className)}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'whitespace-nowrap bg-slate-50 px-4 py-2 text-left align-middle font-bold text-slate-800 first:rounded-tl-md last:rounded-tr-md [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle text-sm text-sky-950 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-sky-950', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

type TableHeaderActionsProps<TData> = {
  column: Column<TData>;
  columnIndex: number;
  columnCount: number;
  setPinOrder: (columnId: string, direction: 'left' | 'right') => void;
  setColumnOrder: (columnId: string, direction: 'left' | 'right') => void;
  preventUnpinning?: boolean;
  prevColumn?: Column<TData>;
  nextColumn?: Column<TData>;
};

const TableHeaderActions = <TData extends object>({
  column,
  columnIndex,
  columnCount,
  setPinOrder,
  setColumnOrder,
  preventUnpinning,
  prevColumn,
  nextColumn
}: TableHeaderActionsProps<TData>) => {
  const isSortable = column.getCanSort();
  const isSorted = column.getIsSorted();
  const isPinnable = column.getCanPin();
  const isPinned = column.getIsPinned();
  const isSortedAsc = isSorted === 'asc';
  const isSortedDesc = isSorted === 'desc';
  const isPrevColumnPinned = prevColumn?.getIsPinned?.() || false;
  const isNextColumnPinned = nextColumn?.getIsPinned?.() || false;
  const isPrevColumnPermanentlyPinned =
    prevColumn?.columnDef?.meta?.preventUnpinning || false;
  const isNextColumnPermanentlyPinned =
    nextColumn?.columnDef?.meta?.preventUnpinning || false;

  const actions = [
    {
      icon: PinRightIcon,
      label: 'Pin left',
      onClick: () => column.pin('left'),
      visible: isPinnable && isPinned !== 'left' && !preventUnpinning
    },
    {
      icon: PinLeftIcon,
      label: 'Pin right',
      onClick: () => column.pin('right'),
      visible: isPinnable && isPinned !== 'right' && !preventUnpinning
    },
    {
      icon: PinRightIcon,
      label: 'Unpin left',
      onClick: () => column.pin(false),
      visible: isPinned === 'left' && !preventUnpinning
    },
    {
      icon: PinLeftIcon,
      label: 'Unpin right',
      onClick: () => column.pin(false),
      visible: isPinned === 'right' && !preventUnpinning
    },
    {
      icon: BarsArrowDownIcon,
      label: 'Sort asc.',
      onClick: () => {
        if (isSortedAsc) return column.clearSorting();

        column.toggleSorting(false);
      },
      highlight: isSortedAsc,
      visible: isSortable
    },
    {
      icon: BarsArrowUpIcon,
      label: 'Sort desc.',
      onClick: () => {
        if (isSortedDesc) return column.clearSorting();

        column.toggleSorting(true);
      },
      highlight: isSortedDesc,
      visible: isSortable
    },
    // For unpinned columns:
    {
      icon: ArrowLeftIcon,
      label: 'Move left',
      onClick: () => setColumnOrder(column.id, 'left'),
      visible:
        columnIndex !== 0 &&
        !isPinned &&
        !isPrevColumnPinned &&
        !isPrevColumnPermanentlyPinned
    },
    {
      icon: ArrowRightIcon,
      label: 'Move right',
      onClick: () => setColumnOrder(column.id, 'right'),
      visible:
        columnIndex !== columnCount - 1 &&
        !isPinned &&
        !isNextColumnPinned &&
        !isNextColumnPermanentlyPinned
    },
    // For pinned columns:
    {
      icon: ArrowLeftIcon,
      label: 'Move left',
      onClick: () => setPinOrder(column.id, 'left'),
      visible:
        isPinned &&
        isPrevColumnPinned &&
        !preventUnpinning &&
        !isPrevColumnPermanentlyPinned
    },
    {
      icon: ArrowRightIcon,
      label: 'Move right',
      onClick: () => setPinOrder(column.id, 'right'),
      visible:
        isPinned &&
        isNextColumnPinned &&
        !preventUnpinning &&
        !isNextColumnPermanentlyPinned
    }
  ].filter((action) => Boolean(action.visible));

  if (actions.length === 0) return null;

  return (
    <Popover.PopoverRoot>
      <Popover.PopoverTrigger asChild>
        <button className='p-2.5 text-slate-800 hover:text-slate-500 focus-visible:outline-none'>
          <EllipsisVerticalIcon className='h-4 w-4 stroke-2' />
        </button>
      </Popover.PopoverTrigger>
      <Popover.PopoverContent
        align='start'
        className='flex flex-col border-1.5 border-slate-200 bg-white'
      >
        {actions.map(({ label, icon: Icon, onClick, highlight }) => (
          <Popover.PopoverClose key={label} asChild>
            <button
              onClick={onClick}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm outline-none hover:bg-slate-50 active:bg-slate-50',
                {
                  'bg-slate-200': highlight
                }
              )}
            >
              <Icon className='stroke-2.5 h-4 w-4 text-slate-800' />
              <span className='font-medium'>{label}</span>
            </button>
          </Popover.PopoverClose>
        ))}
      </Popover.PopoverContent>
    </Popover.PopoverRoot>
  );
};

type TablePinActionProps = SVGProps<SVGSVGElement> & {
  unpin?: () => void;
};
const TablePinAction = forwardRef<SVGSVGElement, TablePinActionProps>(
  ({ className, unpin, ...props }, ref) => (
    <button
      onClick={unpin}
      className={cn('text-slate-800', {
        'cursor-default': !unpin,
        'hover:opacity-80': unpin
      })}
    >
      <PinRightIcon
        ref={ref}
        className={cn('stroke-2.5 h-4 w-4', className)}
        {...props}
      />
    </button>
  )
);

TablePinAction.displayName = 'TablePinAction';

export {
  TableComponents as TableRoot,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TablePinAction,
  TableHeaderActions
};
