'use client';

import { useVCCommonColumns } from '../../vcCommonColumns';
import { useTranslations } from 'next-intl';

import { useGetVC } from '@utils/api/credentials/credentials.hook';

import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

const OverallContent = () => {
  const {
    isLoading,
    data,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) => useGetVC({ ...apiParams })
  });

  const t = useTranslations();
  const vcColumns = useVCCommonColumns();

  return (
    <div>
      <div className='mb-6 text-lg font-bold text-sky-950'>
        {t('credentials.overall_requests')}
      </div>
      <PaginatedTable
        isLoading={isLoading}
        columns={vcColumns}
        onRowClick={() => {}}
        paginationConfig={paginationConfig}
        data={data?.items ?? []}
      />
    </div>
  );
};

export default OverallContent;
