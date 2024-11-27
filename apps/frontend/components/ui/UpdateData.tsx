'use client';

import {
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { cn } from '@utils/cn';
import useTimeElapsed from '@utils/hooks/useTimeElapsed';

import Tooltip from '@ui/tooltip/Tooltip';

import useUpdateStatus from '@components/composed/credentials/useUpdateStatus';
import CreateCredentialOffer from '@components/composed/dialogs/CreateCredentialOffer';

type TUpdateData = {
  onRefetch: () => void;
};

const UpdateData = ({ onRefetch }: TUpdateData) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const timeElapsed = useTimeElapsed(new Date(startTime));
  const { isOfferDialogOpen, setIsOfferDialogOpen } = useUpdateStatus();

  const t = useTranslations();

  const animate = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  const handleRefetch = () => {
    onRefetch();
    setStartTime(Date.now());

    animate();
  };

  const handleCreateOffer = () => {
    setIsOfferDialogOpen(true);
  };

  const onRefetchApprove = () => {
    // onRefetch();
    setIsOfferDialogOpen(false);
  };

  return (
    <>
      <div className='flex items-center gap-4'>
        <div className='flex gap-2 text-sm text-slate-400'>
          {timeElapsed && (
            <>
              <span>{t('global.updated_time_ago', { time: timeElapsed })}</span>
              <Tooltip content={<div>{t('global.updated_tooltip')}</div>}>
                <InformationCircleIcon className='h-4 w-4' />
              </Tooltip>
            </>
          )}
        </div>
        <button
          type='button'
          className='flex cursor-pointer items-center gap-2 text-sm font-medium text-sky-950'
          onClick={handleRefetch}
        >
          <span>{t('global.update_data')}</span>
          <ArrowPathIcon
            className={cn('h-4 w-4', {
              'animate-spin-infinite': isAnimating
            })}
          />
        </button>

        <button
          type='button'
          className='flex cursor-pointer items-center gap-2 text-sm font-medium text-sky-950'
          onClick={handleCreateOffer}
        >
          <span>{t('credentials.offer.create_offer')}</span>
        </button>
      </div>

      <CreateCredentialOffer
        isOpen={isOfferDialogOpen}
        selectedDid={null}
        selectedRowId={null}
        onOpenChange={() => {}}
        onRefetchApprove={onRefetchApprove}
        onCancel={() => {
          setIsOfferDialogOpen(false);
        }}
      />
    </>
  );
};

export default UpdateData;
