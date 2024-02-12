'use client';

import Image from 'next/image';
import type { FC } from 'react';

import logo from '@public/Logo.png';

import { cn } from '@utils/cn';

import NavigationItems from '@components/composed/layout/sidebar/NavigationItems';
import SidebarBottomItems from '@components/composed/layout/sidebar/SidebarBottomItems';

type DesktopSidebarProps = {
  sidebarCollapsed: boolean;
  toggleSidebar: (state?: boolean) => void;
};

const DesktopSidebar: FC<DesktopSidebarProps> = ({
  sidebarCollapsed,
  toggleSidebar
}) => (
  <nav
    className={cn(
      'fixed inset-y-0 flex h-full max-h-full flex-col gap-6 overflow-y-auto overflow-x-hidden bg-linear-gradient px-5 pb-5 pt-6 transition-width',
      {
        'w-60': !sidebarCollapsed,
        'w-20': sidebarCollapsed
      }
    )}
  >
    <div
      className={cn('flex items-center gap-3 text-2xl font-bold text-sky-950', {
        'justify-center': sidebarCollapsed
      })}
    >
      <Image className='h-5 w-auto' src={logo} alt='logo' />
      {!sidebarCollapsed && <span>Enterprise</span>}
    </div>
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

export default DesktopSidebar;
