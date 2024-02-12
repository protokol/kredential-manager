import { redirect } from 'next/navigation';

import { routes } from '@utils/routes';

const IntegrationsPage = async () => {
  redirect(routes.app.integrations.sources.home);
};

export default IntegrationsPage;
