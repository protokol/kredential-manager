'use client';

import { useApiKeyColumns } from './apiKeysColumns';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  useDeleteApiKey,
  useGetApiKeys
} from '@utils/api/apiKeys/apiKeys.hook';
import { toastSuccess } from '@utils/toast';

import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import CreateApikeyDialog from '@components/composed/dialogs/CreateApikeyDialog';
import Button from '@components/ui/Button';

const ApiKeysContent = () => {
  const { mutateAsync: deleteApiKey } = useDeleteApiKey();

  const handleDelete = async (id: string) => {
    await deleteApiKey(id);

    toastSuccess({
      text: 'API key deleted successfully'
    });

    refetch();
  };

  const apiKeysColumns = useApiKeyColumns(handleDelete);
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const {
    isLoading,
    data,
    refetch,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useGetApiKeys({
        ...apiParams
      })
  });

  const handleCreateNew = () => {
    setIsOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setIsOpen(false);
  };

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div className='mb-6 text-lg font-bold text-sky-950'>
          {t('api_keys.title')}
        </div>
        <Button onClick={handleCreateNew} variant='primary'>
          {t('api_keys.create_new')}
        </Button>
      </div>

      <PaginatedTable
        isLoading={isLoading}
        columns={apiKeysColumns}
        paginationConfig={paginationConfig}
        data={data ?? []}
      />

      <CreateApikeyDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ApiKeysContent;
