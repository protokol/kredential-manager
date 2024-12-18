'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import DateCell from '@ui/table/cells/DateCell';

import ActionMenu from '@components/ui/ActionMenu';

// eslint-disable-next-line
const schemaTemplateColumnHelper = createColumnHelper<any>();

export const useSchemaTemplateColumns = (
  onDelete: (id: string) => void,
  // eslint-disable-next-line
  onView: (schema: any) => void
) => {
  const t = useTranslations();

  return [
    schemaTemplateColumnHelper.accessor('name', {
      id: 'name',
      header: t('schemaTemplates.name'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      }
    }),
    schemaTemplateColumnHelper.accessor('types', {
      id: 'types',
      header: t('schemaTemplates.types'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const types = getValue();
        if (!types || !Array.isArray(types)) return null;
        return (
          <span className='text-sm text-slate-600'>{types.join(', ')}</span>
        );
      }
    }),
    schemaTemplateColumnHelper.accessor('isActive', {
      id: 'isActive',
      header: t('schemaTemplates.isActive'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? 'True' : 'False';
      }
    }),
    schemaTemplateColumnHelper.accessor('created_at', {
      id: 'created_at',
      header: t('schemaTemplates.createdAt'),
      cell: ({ getValue }) => <DateCell value={getValue()} />,
      enableSorting: false
    }),
    schemaTemplateColumnHelper.accessor('actions', {
      id: 'actions',
      header: t('schemaTemplates.actions'),
      cell: ({ row }) => {
        const id = row.original.id;

        const actions = [
          {
            label: t('common.delete'),
            onClick: () => onDelete(id)
          },
          {
            label: t('common.view'),
            onClick: () => onView(row.original)
          }
        ];

        return (
          <div className='flex justify-center'>
            <ActionMenu
              items={actions}
              title={t('schemaTemplates.quick_actions')}
            />
          </div>
        );
      },
      enableSorting: false
    })
  ];
};
