import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { useRouter } from '@navigation';

import { useUpdateRequest } from '@utils/api/credentials/credentials.hook';
import { VCStatus } from '@utils/api/credentials/credentials.type';
import type {
  TUpdateStatusParams,
  TVCredential
} from '@utils/api/credentials/credentials.type';
import { routes } from '@utils/routes';
import { toastError, toastInfo, toastSuccess } from '@utils/toast';

import ActionMenu from '@ui/ActionMenu';
import DateCell from '@ui/table/cells/DateCell';
import StatusCell from '@ui/table/cells/StatusCell';
import TitleCell from '@ui/table/cells/TitleCell';

const vcCommonColumnHelper = createColumnHelper<TVCredential>();

export const useVCCommonColumns = (onRefetch: () => void) => {
  const { mutateAsync: updateRequest, isSuccess } = useUpdateRequest();
  const t = useTranslations();
  const { push } = useRouter();

  useEffect(() => {
    if (isSuccess) {
      onRefetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const undoStatus = async ({ id, status }: TUpdateStatusParams) => {
    try {
      const successUndo = await updateRequest({
        id: Number(id),
        status
      });

      if (successUndo) {
        toastInfo({
          text: t('credentials.detailed.action_undone')
        });
      }
    } catch (e) {
      toastError({
        text: t('credentials.error_message')
      });
    }
  };

  const updateStatusHandler = async ({ id, status }: TUpdateStatusParams) => {
    try {
      await updateRequest({
        id,
        status
      });

      if (status === VCStatus.APPROVED)
        toastSuccess({
          text: t('credentials.approved_success'),
          duration: 10000,
          action: () => {
            undoStatus({ id, status: VCStatus.PENDING });
          },
          actionText: t('credentials.detailed.undo')
        });

      if (status === VCStatus.REJECTED)
        toastError({
          text: t('credentials.rejected_success'),
          duration: 10000,
          action: () => {
            undoStatus({ id, status: VCStatus.PENDING });
          },
          actionText: t('credentials.detailed.undo')
        });
    } catch (e) {
      toastError({
        text: t('credentials.error_message')
      });
    }
  };

  return [
    vcCommonColumnHelper.accessor('displayName', {
      id: 'displayName',
      header: t('credentials.columns.name'),
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return null;

        return value;
      },
      enableSorting: false
    }),
    vcCommonColumnHelper.accessor('created_at', {
      id: 'created_at',
      header: t('credentials.columns.date_requested'),
      cell: ({ getValue }) => <DateCell value={getValue()} />,
      enableSorting: false
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
        const status = row.original.status;
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
            onClick: async () => {
              await updateStatusHandler({
                id: getValue(),
                status: VCStatus.APPROVED
              });
            },
            disabled: status === VCStatus.APPROVED
          },
          {
            label: t('credentials.columns.reject'),
            onClick: async () => {
              await updateStatusHandler({
                id: getValue(),
                status: VCStatus.REJECTED
              });
            },
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
      enableSorting: false
    })
  ];
};
