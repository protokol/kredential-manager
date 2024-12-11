import { useTranslations } from 'next-intl';

import OverallContent from '@components/composed/credentials/overall/list/OverallContent';
import ContentLayout from '@components/composed/layout/ContentLayout';

const OverallPage = () => {
  const t = useTranslations();
  return (
    <ContentLayout title={t('credentials.overall')}>
      <OverallContent />
    </ContentLayout>
  );
};

export default OverallPage;
