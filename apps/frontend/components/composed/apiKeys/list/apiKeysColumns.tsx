import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import DateCell from '@ui/table/cells/DateCell';

import ActionMenu from '@components/ui/ActionMenu';

// eslint-disable-next-line
const apiKeysColumnHelper = createColumnHelper<any>();

export const useApiKeyColumns = (onDelete: (id: string) => void) => {
  const t = useTranslations();

  return [
    apiKeysColumnHelper.accessor('name', {
      id: 'name',
      header: t('api_keys.columns.name'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      }
    }),
    apiKeysColumnHelper.accessor('isActive', {
      id: 'isActive',
      header: t('api_keys.columns.is_active'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? 'True' : 'False';
      }
    }),
    apiKeysColumnHelper.accessor('key', {
      id: 'key',
      header: t('api_keys.columns.key'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      }
    }),
    apiKeysColumnHelper.accessor('created_at', {
      id: 'created_at',
      header: t('api_keys.columns.created_at'),
      cell: ({ getValue }) => <DateCell value={getValue()} />,
      enableSorting: false
    }),
    apiKeysColumnHelper.accessor('actions', {
      id: 'actions',
      header: t('api_keys.columns.actions'),
      cell: ({ row }) => {
        const id = row.original.id;

        const actions = [
          {
            label: t('common.delete'),
            onClick: () => onDelete(id)
          }
        ];

        return (
          <div className='flex justify-center'>
            <ActionMenu
              items={actions}
              title={t('api_keys.columns.quick_actions')}
            />
          </div>
        );
      },
      enableSorting: false
    })
  ];
};
