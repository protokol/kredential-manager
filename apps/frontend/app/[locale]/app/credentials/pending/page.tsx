import { useTranslations } from 'next-intl';

import PendingContent from '@components/composed/credentials/pending/list/PendingContent';
import ContentLayout from '@components/composed/layout/ContentLayout';

const PendingPage = () => {
  const t = useTranslations();
  return (
    <ContentLayout title={t('credentials.pending')}>
      <PendingContent />
    </ContentLayout>
  );
};

export default PendingPage;
