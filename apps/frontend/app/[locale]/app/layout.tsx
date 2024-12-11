import type { Metadata } from 'next';
import type { FC, PropsWithChildren } from 'react';

import AuthWrapper from '@components/composed/app/AuthWrapper';
import LayoutWithSidebar from '@components/composed/layout/LayoutWithSidebar';

export const metadata: Metadata = {
  robots: {
    index: false
  }
};
const AppLayout: FC<PropsWithChildren> = ({ children }) => (
  <AuthWrapper>
    <LayoutWithSidebar>{children}</LayoutWithSidebar>
  </AuthWrapper>
);

export default AppLayout;
