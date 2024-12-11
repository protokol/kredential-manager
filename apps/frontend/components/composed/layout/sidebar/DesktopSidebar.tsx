'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import { useMemo } from 'react';

import logo from '@public/enterprise_logo.svg';
import credentialLogo from '@public/kredential_logo.png';

import { cn } from '@utils/cn';
import { routes } from '@utils/routes';

import NavigationItems from '@components/composed/layout/sidebar/NavigationItems';
import SidebarBottomItems from '@components/composed/layout/sidebar/SidebarBottomItems';

type DesktopSidebarProps = {
  sidebarCollapsed: boolean;
  toggleSidebar: (state?: boolean) => void;
};

const DesktopSidebar: FC<DesktopSidebarProps> = ({
  sidebarCollapsed,
  toggleSidebar
}) => {
  const sidebarLogo = useMemo(
    () => (sidebarCollapsed ? logo : credentialLogo),
    [sidebarCollapsed]
  );

  return (
    <nav
      className={cn(
        'fixed inset-y-0 flex h-full max-h-full flex-col gap-6 overflow-y-auto overflow-x-hidden bg-linear-gradient px-5 pb-5 pt-6 transition-width',
        {
          'w-60': !sidebarCollapsed,
          'w-20': sidebarCollapsed
        }
      )}
    >
      <Link href={routes.app.home}>
        <div
          className={cn(
            'flex h-8 items-center gap-3 text-2xl font-bold text-sky-950',
            {
              'justify-center': sidebarCollapsed
            }
          )}
        >
          <Image className='h-6 w-auto' src={sidebarLogo} alt='logo' />
        </div>
      </Link>
      <NavigationItems
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <SidebarBottomItems
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
    </nav>
  );
};

export default DesktopSidebar;
