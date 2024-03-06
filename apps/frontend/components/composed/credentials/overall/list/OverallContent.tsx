'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import { StatusOptions } from '@utils/api/credentials/credentials.type';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';

import PaginatedTable from '@ui/table/PaginatedTable';
import FilterMultiSelect from '@ui/table/filters/FilterMultiSelect';
import useClientSideMultiSelectFilter from '@ui/table/hooks/useClientSideMultiSelectFilter';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import { useVCCommonColumns } from '@components/composed/credentials/vcCommonColumns';

const OverallContent = () => {
  const [filters, setFilters] = useState<string[]>([]);

  const {
    isLoading,
    data,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useGetVC({ ...apiParams, filter: getStatusFilter(filters) })
  });

  const { filteredList: filteredListByType, ...statusFilterConfig } =
    useClientSideMultiSelectFilter(data?.items, StatusOptions, 'status');

  const { selectedItems } = statusFilterConfig;
  const t = useTranslations();
  const vcColumns = useVCCommonColumns();

  useEffect(() => {
    setFilters(selectedItems);
  }, [selectedItems]);

  return (
    <div>
      <div className='mb-6 text-lg font-bold text-sky-950'>
        {t('credentials.overall_requests')}
      </div>
      <div className='my-6'>
        <FilterMultiSelect
          title={t('global.filter_by')}
          {...statusFilterConfig}
          disabled={false}
        />
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
