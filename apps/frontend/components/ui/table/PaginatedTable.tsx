import type { TableProps } from '@ui/table/Table';
import Table from '@ui/table/Table';
import type { TablePaginationConfig } from '@ui/table/TablePaginationFooter';
import TablePaginationFooter from '@ui/table/TablePaginationFooter';

type PaginatedTableProps<TData extends object> = TableProps<TData> & {
  paginationConfig: TablePaginationConfig;
};

const PaginatedTable = <TData extends object>({
  paginationConfig,
  ...tableProps
}: PaginatedTableProps<TData>) => (
  <div>
    <Table {...tableProps} />
    <TablePaginationFooter
      className='mt-4'
      paginationConfig={paginationConfig}
    />
  </div>
);

export default PaginatedTable;
