'use client';

import CredentialAdvanced from './sections/CredentialAdvanced';
import CredentialInformation from './sections/CredentialInformation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useGetVCById } from '@utils/api/credentials/credentials.hook';
import { VCStatus } from '@utils/api/credentials/credentials.type';

import Button from '@ui/Button';
import Spinner from '@ui/Spinner';
import Status from '@ui/Status';
import Accordion from '@ui/accordion/Accordion';

import useUpdateStatus from '@components/composed/credentials/useUpdateStatus';
import ApproveCredentialDialog from '@components/composed/dialogs/ApproveCredentialDialog';
import RejectCredentialDialog from '@components/composed/dialogs/RejectCredentialDialog';

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
  const t = useTranslations();

  const [selectedDid, setSelectedDid] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const {
    isApproveDialogOpen,
    isRejectDialogOpen,
    setIsApproveDialogOpen,
    setIsRejectDialogOpen
  } = useUpdateStatus();

  const onRefetchApprove = () => {
    refetch();
    setIsApproveDialogOpen(false);
  };

  const onRefetchReject = () => {
    refetch();
    setIsRejectDialogOpen(false);
  };

  const onChangeStatus = (
    did: string,
    selectedRowId: string,
    status: VCStatus.APPROVED | VCStatus.REJECTED
  ) => {
    setSelectedDid(did);
    setSelectedRowId(selectedRowId);
    if (status === VCStatus.APPROVED) setIsApproveDialogOpen(true);
    if (status === VCStatus.REJECTED) setIsRejectDialogOpen(true);
  };

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div className='flex w-full items-center gap-4'>
          {credentialData && (
            <div className='ext-lg max-w-64 overflow-hidden text-ellipsis font-bold text-sky-950'>
              {credentialData.did.identifier}
            </div>
          )}
          <Status variant={credentialData?.status} />
        </div>
        {credentialData?.status === VCStatus.PENDING && (
          <div className='ml-4 flex gap-3'>
            <Button
              variant='red'
              onClick={() =>
                onChangeStatus(
                  credentialData.did.identifier,
                  String(credentialData.id),
                  VCStatus.REJECTED
                )
              }
              className='min-w-24'
            >
              {t('credentials.detailed.reject')}
            </Button>
            <Button
              variant='green'
              onClick={() =>
                onChangeStatus(
                  credentialData.did.identifier,
                  String(credentialData.id),
                  VCStatus.APPROVED
                )
              }
              className='min-w-24'
            >
              {t('credentials.detailed.approve')}
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

      <ApproveCredentialDialog
        isOpen={isApproveDialogOpen}
        onRefetchApprove={onRefetchApprove}
        selectedRowId={selectedRowId}
        selectedDid={selectedDid}
        onOpenChange={setIsApproveDialogOpen}
      />

      <RejectCredentialDialog
        isOpen={isRejectDialogOpen}
        onRefetchApprove={onRefetchReject}
        selectedRowId={selectedRowId}
        onOpenChange={setIsRejectDialogOpen}
      />
    </div>
  );
};

export default CredentialDetailedContent;
