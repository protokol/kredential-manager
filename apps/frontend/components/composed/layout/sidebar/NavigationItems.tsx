'use client';

import {
  AdjustmentsVerticalIcon,
  Cog8ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';
import { useState } from 'react';

import { routes } from '@utils/routes';

import SidebarItem, {
  SidebarWithSubItems
} from '@components/ui/sidebar/SidebarItem';

type TNavigationLink = {
  name: string;
  href: string;
  icon?: FC;
  notifications?: number;
};

export type TNavigationButtonWithSubItems = {
  name: string;
  icon: FC<{ className?: string }>;
  subItems: TNavigationLink[];
  match: string;
  sidebarCollapsed?: boolean;
};

type TNavigationItem = TNavigationLink | TNavigationButtonWithSubItems;

const navigationItems: TNavigationItem[] = [
  { name: 'Dashboard', icon: HomeIcon, href: routes.app.home },
  {
    name: 'Credentials',
    icon: DocumentTextIcon,
    match: routes.app.credentials.home,
    subItems: [
      { name: 'Overall', href: routes.app.credentials.overall.home },
      { name: 'Approved', href: routes.app.credentials.approved.home },
      {
        name: 'Pending',
        href: routes.app.credentials.pending.home,
        notifications: 70
      },
      { name: 'Rejected', href: routes.app.credentials.rejected.home }
    ]
  },
  { name: 'Students', href: routes.app.students.home, icon: UsersIcon },
  {
    name: 'Integrations',
    match: routes.app.integrations.home,
    icon: AdjustmentsVerticalIcon,
    subItems: [
      {
        name: 'Sources',
        href: routes.app.integrations.sources.home
      }
    ]
  },
  {
    name: 'Admin',
    href: routes.app.admin.home,
    icon: Cog8ToothIcon,
    subItems: [
      {
        name: 'Users',
        href: routes.app.admin.users.home
      }
    ]
  }
];

type NavigationItemsProps = {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
  asDialog?: boolean;
};

const NavigationItems: FC<NavigationItemsProps> = ({
  sidebarCollapsed,
  toggleSidebar,
  asDialog
}) => {
  const pathname = usePathname();
  const [itemOpen, setItemOpen] = useState<string | null>(null);

  return (
    <div className='flex-grow space-y-1'>
      {navigationItems.map((item, index) => {
        const itemName = sidebarCollapsed ? '' : item.name;
        if ('subItems' in item) {
          return (
            <SidebarWithSubItems
              key={index}
              icon={item.icon}
              match={item.match}
              name={itemName}
              subItems={item.subItems}
              open={itemOpen === item.name && !sidebarCollapsed}
              sidebarCollapsed={sidebarCollapsed}
              onOpenChange={(open) => {
                if (sidebarCollapsed) {
                  toggleSidebar?.();
                }
                if (open) {
                  setItemOpen(item.name);
                } else {
                  setItemOpen(null);
                }
              }}
            />
          );
        }

        return (
          <SidebarItem
            key={index}
            icon={item.icon}
            href={item.href}
            name={itemName}
            active={item.href === pathname}
            asDialog={asDialog}
          />
        );
      })}
    </div>
  );
};

export default NavigationItems;
