'use client';

import {
  BellIcon,
  PlusIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import { StatusOptions } from '@utils/api/credentials/credentials.type';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';
import { routes } from '@utils/routes';

import InfoCard from '@ui/InfoCard';
import PaginatedTable from '@ui/table/PaginatedTable';
import FilterMultiSelect from '@ui/table/filters/FilterMultiSelect';
import useClientSideMultiSelectFilter from '@ui/table/hooks/useClientSideMultiSelectFilter';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import { useNotifications } from '@components/composed/NotificationsProvider';
import { useAuth } from '@components/composed/auth/AuthProvider';
import { useVCCommonColumns } from '@components/composed/credentials/vcCommonColumns';
import ContentLayout from '@components/composed/layout/ContentLayout';

const AppPage = () => {
  const { user } = useAuth();
  const t = useTranslations();
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
  const vcColumns = useVCCommonColumns();

  const { selectedItems } = statusFilterConfig;
  const { overall, pending } = useNotifications();

  useEffect(() => {
    setFilters(selectedItems);
  }, [selectedItems]);

  return (
    <ContentLayout
      title={
        user?.name && t('dashboard.good_afternoon', { username: user?.name })
      }
    >
      <div className='flex gap-4'>
        <InfoCard
          className='w-full'
          title={overall || t('global.n_a')}
          label={t('dashboard.issued_credentials')}
          icon={BellIcon}
          link={routes.app.credentials.overall.home}
          anchorText={t('dashboard.view_all_credentials')}
        />
        <InfoCard
          className='w-full'
          title={pending || t('global.n_a')}
          label={t('dashboard.pending_requests')}
          icon={PlusIcon}
          link={routes.app.credentials.pending.home}
          anchorText={t('dashboard.view_pending_requests')}
        />
        <InfoCard
          title={t('dashboard.resources')}
          label={t('dashboard.need_help')}
          icon={QuestionMarkCircleIcon}
          link='/'
          anchorText={t('dashboard.visit_our_center')}
          className='w-full bg-radial-gradient'
        />
      </div>
      <div className='mt-6'>
        <FilterMultiSelect
          title={t('global.filter_by')}
          {...statusFilterConfig}
          disabled={false}
        />
      </div>
      <div className='my-6 text-lg font-bold text-sky-950'>
        {t('credentials.latest_credentials')}
      </div>
      <PaginatedTable
        isLoading={isLoading}
        columns={vcColumns}
        onRowClick={() => {}}
        paginationConfig={paginationConfig}
        data={data?.items ?? []}
      />
    </ContentLayout>
  );
};

export default AppPage;
