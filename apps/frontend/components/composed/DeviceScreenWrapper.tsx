'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import type { FC, PropsWithChildren } from 'react';

import logo from '@public/Logo.png';

import useIsMobile from '@utils/hooks/useIsMobile';

import FullHeightCenterLayout from '@components/composed/layout/FullHeightCenterLayout';

const DeviceScreenWrapper: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <FullHeightCenterLayout>
        <div className='flex w-full max-w-md flex-col items-center space-y-10'>
          <div className='flex justify-center'>
            <Image alt='logo' src={logo} />
          </div>

          <div className='flex flex-col items-center space-y-2 text-center'>
            <div className='text-3xl font-bold text-slate-800'>
              {t('desktop_only_page.hey_there')}
            </div>
            <div className='max-w-xs text-center text-sm text-slate-800'>
              {t('desktop_only_page.breakpoint_info')}{' '}
              <Link className='text-sky-500 underline' href='/'>
                {t('desktop_only_page.report_issue_here')}
              </Link>
            </div>
          </div>
        </div>
      </FullHeightCenterLayout>
    );
  }

  return <div>{children}</div>;
};

export default DeviceScreenWrapper;
