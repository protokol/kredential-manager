'use client';

import type { FC, PropsWithChildren } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@utils/cn';

import DesktopSidebar from '@components/composed/layout/sidebar/DesktopSidebar';

const LayoutWithSidebar: FC<PropsWithChildren> = ({ children }) => {
  const [collapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(storedValue === 'true');
    }
  }, []);

  const toggleSidebar = useCallback(
    (open?: boolean) => {
      const isCollapsed = open === undefined ? !collapsed : open;

      setIsCollapsed(isCollapsed);

      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
      }
    },
    [collapsed]
  );

  return (
    <div className='h-screen'>
      <DesktopSidebar
        sidebarCollapsed={collapsed}
        toggleSidebar={toggleSidebar}
      />
      <div
        className={cn('flex', {
          'lg:pl-60': !collapsed,
          'lg:pl-20': collapsed
        })}
      >
        {children}
      </div>
    </div>
  );
};

export default LayoutWithSidebar;
