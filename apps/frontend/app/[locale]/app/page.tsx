'use client';

import { useTranslations } from 'next-intl';

import { useGetPrivate } from '@utils/api/user/user.hook';

import Button from '@ui/Button';

import { useAuth } from '@components/composed/auth/AuthProvider';
import ContentLayout from '@components/composed/layout/ContentLayout';

const AppPage = () => {
  const { user } = useAuth();
  const t = useTranslations();

  const { data, refetch } = useGetPrivate();

  const getSomething = () => {
    refetch();
  };

  return (
    <ContentLayout
      title={t('dashboard.good_afternoon', { username: user?.name })}
    >
      <div>
        <div>App page</div>
        <Button onClick={getSomething}>Get Privacy</Button>
        {data && <div>{data}</div>}
      </div>
    </ContentLayout>
  );
};

export default AppPage;
