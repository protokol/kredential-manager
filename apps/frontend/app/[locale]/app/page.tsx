'use client';

import { useTranslations } from 'next-intl';

import { useAuth } from '@components/composed/auth/AuthProvider';
import DashboardContent from '@components/composed/dashboard/DashboardContent';
import ContentLayout from '@components/composed/layout/ContentLayout';

const AppPage = () => {
  const { user } = useAuth();
  const t = useTranslations();

  return (
    <ContentLayout
      title={
        user?.name && t('dashboard.good_afternoon', { username: user?.name })
      }
    >
      <DashboardContent />
    </ContentLayout>
  );
};

export default AppPage;
