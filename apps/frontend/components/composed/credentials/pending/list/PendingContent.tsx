'use client';

import { useTranslations } from 'next-intl';

import { useRouter } from '@navigation';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';
import { routes } from '@utils/routes';

import UpdateData from '@ui/UpdateData';
import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import { useVCCommonColumns } from '@components/composed/credentials/vcCommonColumns';

const PendingContent = () => {
  const {
    isLoading,
    data,
    refetch,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useGetVC({ ...apiParams, filter: getStatusFilter(['pending']) })
  });
  const { push } = useRouter();

  const onRefetch = () => {
    refetch();
  };

  const t = useTranslations();
  const vcColumns = useVCCommonColumns(onRefetch);

  return (
    <div>
      <div className='mb-6 flex justify-between'>
        <div className='text-lg font-bold text-sky-950'>
          {t('credentials.latest_requests')}
        </div>
        <UpdateData onRefetch={onRefetch} />
      </div>

      <PaginatedTable
        isLoading={isLoading}
        columns={vcColumns}
        onRowClick={(rowData) => {
          push(routes.app.credentials.view(String(rowData.id)));
        }}
        paginationConfig={paginationConfig}
        data={data?.items ?? []}
      />
    </div>
  );
};

export default PendingContent;
