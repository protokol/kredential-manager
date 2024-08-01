'use client';

import {
  BellIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@navigation';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import { StatusOptions } from '@utils/api/credentials/credentials.type';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';
import { routes } from '@utils/routes';

import InfoCard from '@ui/InfoCard';
import UpdateData from '@ui/UpdateData';
import Table from '@ui/table/Table';
import FilterMultiSelect from '@ui/table/filters/FilterMultiSelect';
import useClientSideMultiSelectFilter from '@ui/table/hooks/useClientSideMultiSelectFilter';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import { useNotifications } from '@components/composed/NotificationsProvider';
import { useVCCommonColumns } from '@components/composed/credentials/vcCommonColumns';
import HandleStudentsDialog from '@components/composed/dialogs/HandleStudentsDialog';

const DashboardContent = () => {
  const t = useTranslations();
  const [filters, setFilters] = useState<string[]>([]);
  const { push } = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDid, setSelectedDid] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const { isLoading, data, refetch } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useGetVC({ ...apiParams, filter: getStatusFilter(filters) })
  });

  const onRefetch = () => {
    refetch();
  };

  const onRefetchApprove = () => {
    refetch();
    closeDialog();
  };

  const onChangeStatus = (did: string, selectedRowId: string) => {
    setSelectedDid(did);
    setSelectedRowId(selectedRowId);
    openDialog();
  };

  const { filteredList: filteredListByType, ...statusFilterConfig } =
    useClientSideMultiSelectFilter(data?.items, StatusOptions, 'status');
  const vcColumns = useVCCommonColumns(onRefetch, onChangeStatus);

  const { selectedItems } = statusFilterConfig;
  const { overall, pending } = useNotifications();

  useEffect(() => {
    setFilters(selectedItems);
  }, [selectedItems]);

  return (
    <div>
      <div className='flex gap-4'>
        <InfoCard
          className='w-full'
          title={overall || t('global.n_a')}
          label={t('dashboard.issued_credentials')}
          icon={DocumentTextIcon}
          link={routes.app.credentials.overall.home}
          anchorText={t('dashboard.view_all_credentials')}
        />
        <InfoCard
          className='w-full'
          title={pending || t('global.n_a')}
          label={t('dashboard.pending_requests')}
          icon={BellIcon}
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
      <div className='mb-4 mt-6 text-lg font-bold text-sky-950'>
        {t('credentials.latest_credentials')}
      </div>

      <div className='mb-6 flex justify-between'>
        <FilterMultiSelect
          title={t('global.filter_by')}
          {...statusFilterConfig}
          disabled={false}
        />
        <UpdateData onRefetch={onRefetch} />
      </div>
      <Table
        isLoading={isLoading}
        columns={vcColumns}
        onRowClick={(rowData) => {
          push(routes.app.credentials.view(String(rowData.id)));
        }}
        data={data?.items ?? []}
      />
      <HandleStudentsDialog
        isOpen={isDialogOpen}
        selectedRowId={selectedRowId}
        selectedDid={selectedDid}
        onRefetchApprove={onRefetchApprove}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default DashboardContent;
