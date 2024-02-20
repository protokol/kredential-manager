'use client';

import { useTranslations } from 'next-intl';

import { useAuth } from '@components/composed/auth/AuthProvider';
import ContentLayout from '@components/composed/layout/ContentLayout';

const AppPage = () => {
  const { user } = useAuth();
  const t = useTranslations();
  return (
    <ContentLayout
      title={t('dashboard.good_afternoon', { username: user?.name })}
    >
      <div>App page</div>
    </ContentLayout>
  );
};

export default AppPage;
