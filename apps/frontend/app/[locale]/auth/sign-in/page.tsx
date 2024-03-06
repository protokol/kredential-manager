import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import logo from '@public/BigLogo.png';

import SignInForm from '@components/composed/auth/SignInForm';
import FullHeightCenterLayout from '@components/composed/layout/FullHeightCenterLayout';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account'
};

const SignInPage = () => {
  const t = useTranslations();
  return (
    <FullHeightCenterLayout>
      <div className='flex w-full max-w-md flex-col items-center space-y-10'>
        <div className='flex justify-center'>
          <Image alt='logo' src={logo} className='w-60' />
        </div>

        <div className='flex flex-col items-center space-y-2 text-center'>
          <div className='text-3xl font-bold text-slate-800'>
            {t('sign_in_page.welcome_back')}
          </div>
          <div className='max-w-xs font-normal text-slate-800'>
            {t('sign_in_page.enter_your_credentials')}
          </div>
        </div>

        <div className='w-80'>
          <SignInForm />
        </div>

        <div className='text-center text-sm text-slate-800'>
          {t('sign_in_page.having_issues')}{' '}
          <Link className='text-sky-500 underline' href='/'>
            {t('sign_in_page.get_in_touch')}
          </Link>
        </div>
      </div>
    </FullHeightCenterLayout>
  );
};

export default SignInPage;
