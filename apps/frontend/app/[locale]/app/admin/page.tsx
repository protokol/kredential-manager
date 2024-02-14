import { redirect } from 'next/navigation';

import { routes } from '@utils/routes';

const AdminPage = async () => {
  redirect(routes.app.admin.users.home);
};

export default AdminPage;
