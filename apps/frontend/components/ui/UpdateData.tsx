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

type TUpdateData = {
  onRefetch: () => void;
};

const UpdateData = ({ onRefetch }: TUpdateData) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const timeElapsed = useTimeElapsed(new Date(startTime));

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

  return (
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
    </div>
  );
};

export default UpdateData;
