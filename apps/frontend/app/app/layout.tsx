import type { Metadata } from 'next';
import type { FC, PropsWithChildren } from 'react';

import LayoutWithSidebar from '@components/composed/layout/LayoutWithSidebar';

export const metadata: Metadata = {
  robots: {
    index: false
  }
};
const AppLayout: FC<PropsWithChildren> = ({ children }) => (
  <LayoutWithSidebar>{children}</LayoutWithSidebar>
);

export default AppLayout;
