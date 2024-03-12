import { useTranslations } from 'next-intl';
import type { FC } from 'react';

import CredentialDetailedContent from '@components/composed/credentials/CredentialDetailedContent/index';
import ContentLayout from '@components/composed/layout/ContentLayout';

type CredentialDetailedPageProps = {
  params: {
    credentialId: string;
  };
};

const CredentialDetailedPage: FC<CredentialDetailedPageProps> = ({
  params: { credentialId }
}: CredentialDetailedPageProps) => {
  const t = useTranslations();
  return (
    <ContentLayout title={t('credentials.credential')}>
      <CredentialDetailedContent credentialId={credentialId} />
    </ContentLayout>
  );
};

export default CredentialDetailedPage;
