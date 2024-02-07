import type { SortDirection } from '@tanstack/react-table';
import clsx from 'clsx';
import type { FC } from 'react';

type TableSortIconProps = {
  direction: false | SortDirection;
};

const TableSortIcon: FC<TableSortIconProps> = ({ direction }) => (
  <div>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth='1.5'
      stroke='currentColor'
      className={clsx('h-2 w-2', {
        'stroke-3': direction === 'desc'
      })}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M4.5 15.75l7.5-7.5 7.5 7.5'
      />
    </svg>

    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth='1.5'
      stroke='currentColor'
      className={clsx('-mt-0.5 h-2 w-2', {
        'stroke-3': direction === 'asc'
      })}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M19.5 8.25l-7.5 7.5-7.5-7.5'
      />
    </svg>
  </div>
);

export default TableSortIcon;
