import type { FC } from 'react';

import { cn } from '@utils/cn';

import TablePagination from '@ui/table/TablePagination';
import TableResultsPerPage from '@ui/table/TableResultsPerPage';

export type TablePaginationConfig = {
  totalResults: number;
  resultsPerPage: number;
  currentPage: number;
  setResultsPerPage: (resultsPerPage: number) => void;
  setCurrentPage: (currentPage: number) => void;
};

type TablePaginationFooterProps = {
  paginationConfig: TablePaginationConfig;
  className?: string;
};

const TablePaginationFooter: FC<TablePaginationFooterProps> = ({
  paginationConfig,
  className
}) => (
  <div className={cn('flex flex-wrap justify-between gap-4', className)}>
    <TableResultsPerPage
      disabled={!paginationConfig.totalResults}
      pageSize={paginationConfig.resultsPerPage}
      onResultsPerPageChange={paginationConfig.setResultsPerPage}
    />
    <TablePagination
      totalPages={Math.ceil(
        (paginationConfig.totalResults || 0) / paginationConfig.resultsPerPage
      )}
      disabled={!paginationConfig.totalResults}
      currentPage={paginationConfig.currentPage}
      onPageChange={paginationConfig.setCurrentPage}
    />
  </div>
);

export default TablePaginationFooter;
