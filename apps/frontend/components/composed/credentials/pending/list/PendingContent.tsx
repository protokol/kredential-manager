'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useRouter } from '@navigation';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';
import { routes } from '@utils/routes';

import UpdateData from '@ui/UpdateData';
import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import { useVCCommonColumns } from '@components/composed/credentials/vcCommonColumns';
import HandleStudentsDialog from '@components/composed/dialogs/HandleStudentsDialog';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDid, setSelectedDid] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const { push } = useRouter();

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

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
  const t = useTranslations();
  const vcColumns = useVCCommonColumns(onRefetch, onChangeStatus);

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
      <HandleStudentsDialog
        isOpen={isDialogOpen}
        onRefetchApprove={onRefetchApprove}
        selectedDid={selectedDid}
        selectedRowId={selectedRowId}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default PendingContent;
