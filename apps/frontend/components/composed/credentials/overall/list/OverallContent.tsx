'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@navigation';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import {
  StatusOptions,
  VCStatus
} from '@utils/api/credentials/credentials.type';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';
import { routes } from '@utils/routes';

import UpdateData from '@ui/UpdateData';
import PaginatedTable from '@ui/table/PaginatedTable';
import FilterMultiSelect from '@ui/table/filters/FilterMultiSelect';
import useClientSideMultiSelectFilter from '@ui/table/hooks/useClientSideMultiSelectFilter';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import useUpdateStatus from '@components/composed/credentials/useUpdateStatus';
import { useVCCommonColumns } from '@components/composed/credentials/vcCommonColumns';
import ApproveCredentialDialog from '@components/composed/dialogs/ApproveCredentialDialog';
import RejectCredentialDialog from '@components/composed/dialogs/RejectCredentialDialog';

const OverallContent = () => {
  const [filters, setFilters] = useState<string[]>([]);
  const { push } = useRouter();
  const [selectedDid, setSelectedDid] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const {
    isApproveDialogOpen,
    isRejectDialogOpen,
    setIsApproveDialogOpen,
    setIsRejectDialogOpen
  } = useUpdateStatus();

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

  const { selectedItems } = statusFilterConfig;
  const t = useTranslations();
  const vcColumns = useVCCommonColumns(onChangeStatus);

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

export default OverallContent;
