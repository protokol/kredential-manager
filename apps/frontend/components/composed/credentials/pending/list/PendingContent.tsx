'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useRouter } from '@navigation';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import { VCStatus } from '@utils/api/credentials/credentials.type';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';
import { routes } from '@utils/routes';

import UpdateData from '@ui/UpdateData';
import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import useUpdateStatus from '@components/composed/credentials/useUpdateStatus';
import { useVCCommonColumns } from '@components/composed/credentials/vcCommonColumns';
import ApproveCredentialDialog from '@components/composed/dialogs/ApproveCredentialDialog';
import RejectCredentialDialog from '@components/composed/dialogs/RejectCredentialDialog';

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
  const [selectedDid, setSelectedDid] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const { push } = useRouter();

  const {
    isApproveDialogOpen,
    isRejectDialogOpen,
    setIsApproveDialogOpen,
    setIsRejectDialogOpen
  } = useUpdateStatus();

  const onRefetchApprove = () => {
    refetch();
    setIsApproveDialogOpen(false);
  };

  const onRefetchReject = () => {
    refetch();
    setIsRejectDialogOpen(false);
  };

  const onRefetch = () => {
    refetch();
  };
  const onChangeStatus = (
    did: string,
    selectedRowId: string,
    status: VCStatus.APPROVED | VCStatus.REJECTED
  ) => {
    setSelectedDid(did);
    setSelectedRowId(selectedRowId);
    if (status === VCStatus.APPROVED) setIsApproveDialogOpen(true);
    if (status === VCStatus.REJECTED) setIsRejectDialogOpen(true);
  };

  const t = useTranslations();
  const vcColumns = useVCCommonColumns(onChangeStatus);

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

      <ApproveCredentialDialog
        isOpen={isApproveDialogOpen}
        onRefetchApprove={onRefetchApprove}
        selectedRowId={selectedRowId}
        selectedDid={selectedDid}
        onOpenChange={setIsApproveDialogOpen}
      />

      <RejectCredentialDialog
        isOpen={isRejectDialogOpen}
        onRefetchApprove={onRefetchReject}
        selectedRowId={selectedRowId}
        onOpenChange={setIsRejectDialogOpen}
      />
    </div>
  );
};

export default PendingContent;
