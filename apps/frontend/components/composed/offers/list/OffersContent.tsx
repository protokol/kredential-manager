'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useOffersColumns } from './offersColumns';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useRouter } from '@navigation';

import { useDeleteOffer, useOffers } from '@utils/api/offers/offers.hook';
import { routes } from '@utils/routes';
import { toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import CreateOfferDialog from '@components/composed/dialogs/CreateOfferDialog';

export const OffersContent = () => {
  const t = useTranslations();
  const [createOfferDialogOpen, setCreateOfferDialogOpen] = useState(false);
  const { mutateAsync: deleteOffer } = useDeleteOffer();

  const {
    isLoading,
    data: offers,
    refetch,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useOffers({
        ...apiParams
      }) as any
  });

  const { push } = useRouter();

  const handleDelete = async (id: string) => {
    await deleteOffer(id);

    toastSuccess({
      text: 'Offer deleted successfully'
    });

    refetch();
  };

  const handleView = (id: string) => {
    push(routes.app.offers.view(id));
  };

  const columns = useOffersColumns(handleDelete, handleView);

  const handleCreateNew = () => {
    setCreateOfferDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setCreateOfferDialogOpen(false);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='mb-6 text-lg font-bold text-sky-950'>
          {t('offers.title')}
        </div>
        <Button onClick={handleCreateNew}>
          <PlusIcon className='mr-2 h-4 w-4' />
          {t('offers.create')}
        </Button>
      </div>

      <PaginatedTable
        columns={columns}
        data={(offers as any) || []}
        isLoading={isLoading}
        paginationConfig={paginationConfig}
      />

      <CreateOfferDialog
        isOpen={createOfferDialogOpen}
        onOpenChange={setCreateOfferDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
