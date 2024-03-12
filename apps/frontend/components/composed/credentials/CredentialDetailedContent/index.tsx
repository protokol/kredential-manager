'use client';

import CredentialAdvanced from './sections/CredentialAdvanced';
import CredentialInformation from './sections/CredentialInformation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { useGetVCById } from '@utils/api/credentials/credentials.hook';
import { useUpdateRequest } from '@utils/api/credentials/credentials.hook';
import { VCStatus } from '@utils/api/credentials/credentials.type';
import { toastError, toastInfo, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import Spinner from '@ui/Spinner';
import Status from '@ui/Status';
import Accordion from '@ui/accordion/Accordion';

const CredentialDetailedContent = ({
  credentialId
}: {
  credentialId: string;
}) => {
  const {
    data: credentialData,
    isLoading,
    refetch
  } = useGetVCById(credentialId);
  const { mutateAsync: updateRequest, isSuccess } = useUpdateRequest();
  const t = useTranslations();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const undoStatus = async ({ status }: { status: VCStatus }) => {
    try {
      const successUndo = await updateRequest({
        id: Number(credentialId),
        status
      });

      if (successUndo) {
        toastInfo({
          text: t('credentials.detailed.action_undone'),
          duration: 10000
        });
      }
    } catch (e) {
      toastError({
        text: t('credentials.error_message')
      });
    }
  };

  const updateStatusHandler = async ({ status }: { status: VCStatus }) => {
    try {
      const success = await updateRequest({
        id: Number(credentialId),
        status
      });

      if (success) {
        if (status === VCStatus.APPROVED)
          toastSuccess({
            text: t('credentials.approved_success'),
            duration: 10000,
            action: () => {
              undoStatus({ status: VCStatus.PENDING });
            },
            actionText: t('credentials.detailed.undo')
          });

        if (status === VCStatus.REJECTED)
          toastError({
            text: t('credentials.rejected_success'),
            duration: 10000,
            action: () => {
              undoStatus({ status: VCStatus.PENDING });
            },
            actionText: t('credentials.detailed.undo')
          });
      }
    } catch (e) {
      toastError({
        text: t('credentials.error_message')
      });
    }
  };

  const onApprove = async () => {
    await updateStatusHandler({
      status: VCStatus.APPROVED
    });
  };

  const onReject = async () => {
    await updateStatusHandler({
      status: VCStatus.REJECTED
    });
  };

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {credentialData && <span>{credentialData.did.identifier}</span>}
          <Status variant={credentialData?.status} />
        </div>
        {credentialData?.status === VCStatus.PENDING && (
          <div className='flex gap-3'>
            <Button variant='green' onClick={onApprove}>
              {t('credentials.detailed.approve')}
            </Button>
            <Button variant='red' onClick={onReject}>
              {t('credentials.detailed.reject')}
            </Button>
          </div>
        )}
      </div>
      {isLoading ? (
        <div className='flex justify-center'>
          <Spinner />
        </div>
      ) : (
        <Accordion
          type='multiple'
          defaultValue={['1']}
          items={[
            {
              id: '1',
              title: t('credentials.detailed.information'),
              content: <CredentialInformation {...credentialData?.did} />
            },
            {
              id: '2',
              title: t('credentials.detailed.advanced'),
              content: <CredentialAdvanced credentialData={credentialData} />
            }
          ]}
        />
      )}
    </div>
  );
};

export default CredentialDetailedContent;
