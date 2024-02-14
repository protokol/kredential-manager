import { redirect } from '@navigation';

import { routes } from '@utils/routes';

const CredentialsPage = async () =>
  redirect(routes.app.credentials.approved.home);

export default CredentialsPage;
