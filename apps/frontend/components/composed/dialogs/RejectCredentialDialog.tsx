import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';

import { useUpdateRequest } from '@utils/api/credentials/credentials.hook';
import { VCStatus } from '@utils/api/credentials/credentials.type';
import type { TUpdateStatusParams } from '@utils/api/credentials/credentials.type';
import { toastError, toastInfo, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';

export default function RejectCredentialDialog({
  isOpen,
  selectedRowId,
  onOpenChange,
  onRefetchApprove
}: {
  isOpen: boolean;
  selectedRowId: string | null;
  onRefetchApprove?: () => void;
  onOpenChange: (flag: boolean) => void;
}) {
  const { mutateAsync: updateRequest } = useUpdateRequest();

  const undoStatus = async ({ id, status }: TUpdateStatusParams) => {
    try {
      const successUndo = await updateRequest({
        id: Number(id),
        status
      });

      onRefetchApprove!();

      if (successUndo) {
        toastInfo({
          text: t('credentials.detailed.action_undone'),
          duration: 3000
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

      if (status === VCStatus.REJECTED)
        toastSuccess({
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

  // eslint-disable-next-line
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await updateStatusHandler({
        id: Number(selectedRowId),
        status: VCStatus.REJECTED
      });

      onRefetchApprove!();
    } catch (e) {
      // eslint-disable-next-line
      console.log('Something went wrong', e);
    }
  };

  const t = useTranslations();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-40 bg-sky-950 bg-opacity-50' />
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-128 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-8 shadow-lg'>
          <Dialog.Title className='mb-4 flex flex-col items-center justify-center gap-4 text-center text-lg text-sky-950'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <ExclamationTriangleIcon className='h-6 w-6' color='red' />
            </div>
            {t('credentials.reject.title')}
          </Dialog.Title>
          <div className='text-center text-sm text-slate-500'>
            {t('credentials.reject.description')}
          </div>
          <div className='mt-6 flex justify-end space-x-2'>
            <Dialog.Close asChild>
              <Button
                className='w-full border-slate-300 text-xs text-slate-500'
                variant='secondary'
              >
                {t('credentials.reject.cancel')}
              </Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button
                className='w-full text-xs'
                variant='red'
                onClick={handleSubmit}
              >
                {t('credentials.reject.submit')}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
