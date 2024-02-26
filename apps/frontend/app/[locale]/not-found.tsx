import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import logo from '@public/Logo.png';

import { routes } from '@utils/routes';

import Button from '@ui/Button';

import FullHeightCenterLayout from '@components/composed/layout/FullHeightCenterLayout';

export const metadata: Metadata = {
  title: 'Page not found'
};

const PageNotFound = () => {
  const t = useTranslations();
  return (
    <FullHeightCenterLayout>
      <div className='flex w-full max-w-md flex-col items-center space-y-10'>
        <div className='flex justify-center'>
          <Image alt='logo' src={logo} />
        </div>

        <div className='flex flex-col items-center space-y-2 text-center'>
          <div className='text-3xl font-bold text-slate-800'>
            {t('not_found_page.error_404')}
          </div>
          <div className='max-w-xs font-normal text-slate-800'>
            {t('not_found_page.page_not_found_info')}
          </div>
        </div>

        <div className='w-80'>
          <Button asChild className='w-full'>
            <Link href={routes.app.home}>
              {t('not_found_page.take_me_home')}
            </Link>
          </Button>
        </div>

        <div className='text-center text-sm text-slate-800'>
          {t('not_found_page.seeing_this_page')}{' '}
          <Link className='text-sky-500 underline' href='/'>
            {t('not_found_page.report_issue_here')}
          </Link>
        </div>
      </div>
    </FullHeightCenterLayout>
  );
};

export default PageNotFound;
