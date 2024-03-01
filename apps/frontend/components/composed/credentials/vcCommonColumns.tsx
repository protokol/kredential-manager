import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { updateVCStatus } from '@utils/api/credentials/credentials.api';
import { VCStatus } from '@utils/api/credentials/credentials.type';
import type { TVCredential } from '@utils/api/credentials/credentials.type';

import ActionMenu from '@ui/ActionMenu';
import DateCell from '@ui/table/cells/DateCell';
import StatusCell from '@ui/table/cells/StatusCell';
import TitleCell from '@ui/table/cells/TitleCell';

const vcCommonColumnHelper = createColumnHelper<TVCredential>();

export const useVCCommonColumns = () => {
  const t = useTranslations();
  return [
    vcCommonColumnHelper.accessor('displayName', {
      id: 'displayName',
      header: t('credentials.columns.name'),
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      }
    }),
    vcCommonColumnHelper.accessor('created_at', {
      id: 'created_at',
      header: t('credentials.columns.date_requested'),
      cell: ({ getValue }) => <DateCell value={getValue()} />
    }),
    vcCommonColumnHelper.accessor('role', {
      id: 'role',
      header: t('credentials.columns.role'),
      cell: ({ getValue }) => <TitleCell value={getValue()} />
    }),
    vcCommonColumnHelper.accessor('type', {
      id: 'type',
      header: t('credentials.columns.type'),
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      }
    }),
    vcCommonColumnHelper.accessor('mail', {
      id: 'mail',
      header: t('credentials.columns.email'),
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      }
    }),
    vcCommonColumnHelper.accessor('status', {
      id: 'status',
      header: t('credentials.columns.status'),
      cell: ({ getValue }) => <StatusCell value={getValue()} />
    }),
    vcCommonColumnHelper.accessor('id', {
      id: 'actions',
      header: t('credentials.columns.actions'),
      cell: ({ getValue }) => {
        const actions = [
          {
            label: t('credentials.columns.view'),
            // eslint-disable-next-line
            onClick: () => console.warn('View')
          },
          {
            label: t('credentials.columns.approve'),
            // eslint-disable-next-line
            onClick: async () => {
              const id = getValue();
              await updateVCStatus(id, VCStatus.APPROVED);
            }
          },
          {
            label: t('credentials.columns.reject'),
            // eslint-disable-next-line
            onClick: () => console.warn('reject')
          },
          {
            label: t('credentials.columns.report'),
            // eslint-disable-next-line
            onClick: () => console.warn('report')
          }
        ];

        return (
          <div className='flex justify-center'>
            <ActionMenu
              items={actions}
              title={t('credentials.columns.quick_actions')}
            />
          </div>
        );
      }
    })
  ];
};
