import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';

import Button from '@ui/Button';
import Select from '@ui/Select';

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (value: number) => void;
  disabled?: boolean;
};
const TablePagination: FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled
}) => (
  <div className='inline-flex items-center gap-2 text-sm text-slate-500'>
    Page
    <Select
      value={currentPage.toString() || '1'}
      items={Array.from({ length: totalPages || 1 }).map((_, i) => ({
        label: String(i + 1),
        value: String(i + 1)
      }))}
      disabled={totalPages === 1 || disabled}
      onValueChange={(value) => onPageChange(Number(value))}
    />
    <span className='flex-shrink-0'>of {totalPages || 1}</span>
    <Button
      size='icon-default'
      variant='secondary'
      disabled={currentPage === 1 || disabled}
      className='ml-6'
      onClick={() => onPageChange(currentPage - 1)}
    >
      <ChevronLeftIcon className='h-4 w-4 flex-shrink-0' />
    </Button>
    <Button
      size='icon-default'
      variant='secondary'
      disabled={currentPage >= totalPages || disabled}
      onClick={() => onPageChange(currentPage + 1)}
    >
      <ChevronRightIcon className='h-4 w-4 flex-shrink-0' />
    </Button>
  </div>
);

export default TablePagination;
