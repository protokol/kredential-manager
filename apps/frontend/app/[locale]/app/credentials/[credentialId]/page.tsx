import type { FC } from 'react';

type CredentialDetailedPageProps = {
  params: {
    credentialId: string;
  };
};

const CredentialDetailedPage: FC<CredentialDetailedPageProps> = ({
  params: { credentialId }
}: CredentialDetailedPageProps) => <div>credentialId - {credentialId}</div>;

export default CredentialDetailedPage;
