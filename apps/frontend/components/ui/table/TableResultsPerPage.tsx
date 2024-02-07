import type { FC } from 'react';

import Select from '@ui/Select';

type TableResultsPerPageProps = {
  pageSize: number;
  onResultsPerPageChange: (value: number) => void;
  disabled?: boolean;
};
const TableResultsPerPage: FC<TableResultsPerPageProps> = ({
  pageSize,
  onResultsPerPageChange,
  disabled
}) => (
  <div className='inline-flex items-center gap-2 text-sm text-slate-500'>
    <span>Showing</span>
    <Select
      className='tabular-nums'
      value={pageSize.toString()}
      onValueChange={(value) => onResultsPerPageChange(parseInt(value))}
      disabled={disabled}
      items={[
        { label: '10', value: '10' },
        { label: '25', value: '25' },
        { label: '50', value: '50' },
        { label: '100', value: '100' }
      ]}
    />
    <span className='flex-shrink-0'>results</span>
  </div>
);
export default TableResultsPerPage;
