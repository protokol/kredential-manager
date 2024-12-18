import ApiKeysContent from '@components/composed/apiKeys/list/ApiKeysContent';
import ContentLayout from '@components/composed/layout/ContentLayout';

const ApiKeysPage = () => (
  <ContentLayout title='API keys'>
    <ApiKeysContent />
  </ContentLayout>
);

export default ApiKeysPage;
