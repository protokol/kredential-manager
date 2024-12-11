import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { useRouter } from '@navigation';

import { VCStatus } from '@utils/api/credentials/credentials.type';
import type { TVCredential } from '@utils/api/credentials/credentials.type';
import { routes } from '@utils/routes';

import ActionMenu from '@ui/ActionMenu';
import DateCell from '@ui/table/cells/DateCell';
import StatusCell from '@ui/table/cells/StatusCell';
import TitleCell from '@ui/table/cells/TitleCell';

const vcCommonColumnHelper = createColumnHelper<TVCredential>();

export const useVCCommonColumns = (
  onChangeStatus: (
    did: string,
    id: string,
    status: VCStatus.APPROVED | VCStatus.REJECTED
  ) => void
) => {
  const t = useTranslations();
  const { push } = useRouter();

  return [
    vcCommonColumnHelper.accessor('displayName', {
      id: 'displayName',
      header: t('credentials.columns.name'),
      cell: ({ row }) => {
        const first_name = row?.original?.did?.student?.first_name;
        const last_name = row?.original?.did?.student?.last_name;
        if (!first_name || !last_name) return null;
        const fullName = `${first_name} ${last_name}`;

        return fullName;
      },
      enableSorting: false
    }),
    vcCommonColumnHelper.accessor('created_at', {
      id: 'created_at',
      header: t('credentials.columns.date_requested'),
      cell: ({ getValue }) => <DateCell value={getValue()} />
    }),
    vcCommonColumnHelper.accessor('role', {
      id: 'role',
      header: t('credentials.columns.role'),
      cell: ({ getValue }) => <TitleCell value={getValue()} />,
      enableSorting: false
    }),
    vcCommonColumnHelper.accessor('type', {
      id: 'type',
      header: t('credentials.columns.type'),
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      },
      enableSorting: false
    }),
    vcCommonColumnHelper.accessor('mail', {
      id: 'mail',
      header: t('credentials.columns.email'),
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      },
      enableSorting: false
    }),
    vcCommonColumnHelper.accessor('status', {
      id: 'status',
      header: t('credentials.columns.status'),
      cell: ({ getValue }) => <StatusCell value={getValue()} />,
      enableSorting: false
    }),
    vcCommonColumnHelper.accessor('id', {
      id: 'actions',
      header: t('credentials.columns.actions'),
      cell: ({ getValue, row }) => {
        const status = row?.original?.status;
        const did = row?.original?.did?.identifier;
        const actions = [
          {
            label: t('credentials.columns.view'),
            onClick: () => {
              const id = String(getValue());
              push(routes.app.credentials.view(id));
            }
          },
          {
            label: t('credentials.columns.approve'),
            onClick: () =>
              onChangeStatus(did, String(getValue()), VCStatus.APPROVED),
            disabled: status === VCStatus.APPROVED
          },
          {
            label: t('credentials.columns.reject'),
            onClick: () =>
              onChangeStatus(did, String(getValue()), VCStatus.REJECTED),
            disabled: status === VCStatus.REJECTED
          },
          {
            label: t('credentials.columns.report'),
            // eslint-disable-next-line
            onClick: () => console.warn('report'),
            disabled: true
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
      },
      enableSorting: false,
      meta: {
        pinned: 'right',
        preventUnpinning: true
      }
    })
  ];
};
