import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { FC } from 'react';

import * as Popover from '@ui/popover/Popover.components';
import { FilterButton } from '@ui/table/filters/FilterWrapper';

type ActionMenuItem = {
  label: string;
  disabled?: boolean;
} & ({ onClick: () => void } | { href: string });

type ActionMenuProps = {
  title: string;
  items: ActionMenuItem[];
  disabled?: boolean;
};
const ActionMenu: FC<ActionMenuProps> = ({ title, items = [], disabled }) => (
  <Popover.PopoverRoot>
    <Popover.PopoverTrigger asChild>
      <FilterButton
        disabled={disabled || !items.length}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <span>{title}</span>
        <ChevronDownIcon className='h-5 w-5 flex-shrink-0 stroke-2 text-slate-800 transition group-disabled:text-slate-500 group-data-[state=open]:rotate-180' />
      </FilterButton>
    </Popover.PopoverTrigger>
    <Popover.PopoverContent
      onClick={(e) => {
        e.stopPropagation();
      }}
      asChild
      align='start'
      className='z-select max-h-80 w-radix-popover-trigger overflow-y-auto border-1.5 border-slate-200 bg-white'
    >
      <div>
        {items.map((item) => {
          const classes =
            'block w-full text-start disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white px-3 py-2 truncate text-sm font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50';
          if ('onClick' in item) {
            return (
              <button
                className={classes}
                onClick={item.onClick}
                key={item.label}
                disabled={item.disabled}
              >
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link className={classes} href={item.href} key={item.label}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </Popover.PopoverContent>
  </Popover.PopoverRoot>
);

export default ActionMenu;
