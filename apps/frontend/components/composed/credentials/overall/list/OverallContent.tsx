'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@navigation';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import { StatusOptions } from '@utils/api/credentials/credentials.type';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';
import { routes } from '@utils/routes';

import UpdateData from '@ui/UpdateData';
import PaginatedTable from '@ui/table/PaginatedTable';
import FilterMultiSelect from '@ui/table/filters/FilterMultiSelect';
import useClientSideMultiSelectFilter from '@ui/table/hooks/useClientSideMultiSelectFilter';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import { useVCCommonColumns } from '@components/composed/credentials/vcCommonColumns';

const OverallContent = () => {
  const [filters, setFilters] = useState<string[]>([]);
  const { push } = useRouter();

  const {
    isLoading,
    data,
    refetch,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useGetVC({ ...apiParams, filter: getStatusFilter(filters) })
  });

  const { filteredList: filteredListByType, ...statusFilterConfig } =
    useClientSideMultiSelectFilter(data?.items, StatusOptions, 'status');

  const onRefetch = () => {
    refetch();
  };

  const { selectedItems } = statusFilterConfig;
  const t = useTranslations();
  const vcColumns = useVCCommonColumns(onRefetch);

  useEffect(() => {
    setFilters(selectedItems);
  }, [selectedItems]);

  return (
    <div>
      <div className='mb-6 text-lg font-bold text-sky-950'>
        {t('credentials.overall_requests')}
      </div>
      <div className='my-6 flex justify-between'>
        <FilterMultiSelect
          title={t('global.filter_by')}
          {...statusFilterConfig}
          disabled={false}
        />
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

export default OverallContent;
