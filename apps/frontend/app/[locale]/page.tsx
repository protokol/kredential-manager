import { redirect } from '@navigation';

import { routes } from '@utils/routes';

const IndexPage = () => {
  redirect(routes.app.home);
};

export default IndexPage;
