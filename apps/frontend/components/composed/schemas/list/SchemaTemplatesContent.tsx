'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSchemaTemplateColumns } from './schemaTemplatesColumns';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useDeleteSchema, useSchemas } from '@utils/api/schemas/schemas.hook';
import { toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import CreateSchemaTemplateDialog from '@components/composed/dialogs/CreateSchemaTemplateDialog';

export const SchemaTemplatesContent = () => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view'>('create');
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const { mutateAsync: deleteSchema } = useDeleteSchema();

  const {
    isLoading,
    data: schemas,
    refetch,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useSchemas({
        ...apiParams
      })
  });

  const handleDelete = async (id: string) => {
    await deleteSchema(id);

    toastSuccess({
      text: 'Schema template deleted successfully'
    });

    refetch();
  };

  const handleView = (schema: any) => {
    setSelectedSchema(schema);
    setDialogMode('view');
    setIsOpen(true);
  };

  const columns = useSchemaTemplateColumns(handleDelete, handleView);

  const handleCreateNew = () => {
    setSelectedSchema(null);
    setDialogMode('create');
    setIsOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setIsOpen(false);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='mb-6 text-lg font-bold text-sky-950'>
          {t('schemaTemplates.title')}
        </div>
        <Button onClick={handleCreateNew}>
          <PlusIcon className='mr-2 h-4 w-4' />
          {t('schemaTemplates.create')}
        </Button>
      </div>

      <PaginatedTable
        columns={columns}
        data={schemas?.items || []}
        isLoading={isLoading}
        paginationConfig={paginationConfig}
      />

      <CreateSchemaTemplateDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={handleSuccess}
        mode={dialogMode}
        schema={selectedSchema}
      />
    </div>
  );
};
