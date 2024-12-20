/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import DateCell from '@ui/table/cells/DateCell';

import ActionMenu from '@components/ui/ActionMenu';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */

const offersColumnHelper = createColumnHelper<any>();

export const useOffersColumns = (
  onDelete: (id: string) => void,
  onView: (id: string) => void
) => {
  const t = useTranslations();

  return [
    offersColumnHelper.accessor('subject_did', {
      id: 'subject_did',
      header: t('offers.subject_did'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;
        const splicedValue = `${value.slice(0, 20)}...${value.slice(-14)}`;
        return splicedValue;
      }
    }),
    offersColumnHelper.accessor('credential_types', {
      id: 'credential_types',
      header: t('offers.credential_types'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const types = getValue();
        if (!types || !Array.isArray(types)) return null;
        return (
          <span className='text-sm text-slate-600'>{types.join(', ')}</span>
        );
      }
    }),
    offersColumnHelper.accessor('status', {
      id: 'status',
      header: t('offers.status'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;
        return value;
      }
    }),
    offersColumnHelper.accessor('created_at', {
      id: 'created_at',
      header: t('offers.createdAt'),
      cell: ({ getValue }) => <DateCell value={getValue()} />,
      enableSorting: false
    }),
    offersColumnHelper.accessor('actions', {
      id: 'actions',
      header: t('offers.actions'),
      cell: ({ row }) => {
        const id = row.original.id;

        const actions = [
          {
            label: t('common.delete'),
            onClick: () => onDelete(id)
          },
          {
            label: t('common.view'),
            onClick: () => onView(id)
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
