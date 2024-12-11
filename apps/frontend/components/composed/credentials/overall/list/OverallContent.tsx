'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@navigation';

import { useGetVC } from '@utils/api/credentials/credentials.hook';
import {
  StatusOptions,
  VCStatus
} from '@utils/api/credentials/credentials.type';
import type { TVCredential } from '@utils/api/credentials/credentials.type';
import { getStatusFilter } from '@utils/api/credentials/credentials.utils';
import { routes } from '@utils/routes';

import UpdateData from '@ui/UpdateData';
import PaginatedTable from '@ui/table/PaginatedTable';
import FilterMultiSelect from '@ui/table/filters/FilterMultiSelect';
import useClientSideMultiSelectFilter from '@ui/table/hooks/useClientSideMultiSelectFilter';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import { usePagination } from '@components/composed/PaginationProvider';
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

  const { paginationState, updatePaginationState } = usePagination();

  const {
    isLoading,
    data,
    refetch,
    tableConfig: { paginationConfig, sortConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useGetVC({
        ...apiParams,
        filter: getStatusFilter(filters),
        page: paginationState.currentPage - 1,
        size: paginationState.resultsPerPage
      })
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

  const handleRowClick = (rowData: TVCredential) => {
    updatePaginationState({ currentPage: paginationConfig.currentPage });
    push(routes.app.credentials.view(String(rowData.id)));
  };

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
        onRowClick={handleRowClick}
        paginationConfig={{
          ...paginationConfig,
          currentPage: paginationState.currentPage,
          resultsPerPage: paginationState.resultsPerPage,
          setCurrentPage: (page: number) => {
            paginationConfig.setCurrentPage(page);
            updatePaginationState({ currentPage: page });
          },
          setResultsPerPage: (pageSize: number) => {
            paginationConfig.setResultsPerPage(pageSize);
            updatePaginationState({ resultsPerPage: pageSize });
          }
        }}
        sortConfig={sortConfig}
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
