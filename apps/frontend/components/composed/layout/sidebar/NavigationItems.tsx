'use client';

import {
  AdjustmentsVerticalIcon,
  Cog8ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { usePathname } from '@navigation';

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

type TNavigationItem = (TNavigationLink | TNavigationButtonWithSubItems) & {
  id: string;
};

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

  const t = useTranslations();

  const navigationItems: TNavigationItem[] = useMemo(
    () => [
      {
        id: 'home',
        name: t('navigation.dashboard'),
        icon: HomeIcon,
        href: routes.app.home
      },
      {
        id: 'credentials',
        name: t('navigation.credentials'),
        icon: DocumentTextIcon,
        match: routes.app.credentials.home,
        subItems: [
          {
            id: 'credentials-overall',
            name: t('navigation.overall'),
            href: routes.app.credentials.overall.home
          },
          {
            id: 'credentials-pending',
            name: t('navigation.pending'),
            href: routes.app.credentials.pending.home,
            notifications: 70
          }
        ]
      },
      {
        id: 'students',
        name: t('navigation.students'),
        href: routes.app.students.home,
        icon: UsersIcon
      },
      {
        id: 'integrations',
        name: t('navigation.integrations'),
        match: routes.app.integrations.home,
        icon: AdjustmentsVerticalIcon,
        subItems: [
          {
            id: 'integrations-sources',
            name: t('navigation.sources'),
            href: routes.app.integrations.sources.home
          }
        ]
      },
      {
        id: 'admin',
        name: t('navigation.admin'),
        href: routes.app.admin.home,
        icon: Cog8ToothIcon,
        subItems: [
          {
            id: 'admin-users',
            name: t('navigation.users'),
            href: routes.app.admin.users.home
          }
        ]
      }
    ],
    [t]
  );

  return (
    <div className='flex-grow space-y-1'>
      {navigationItems.map((item) => {
        const itemName = sidebarCollapsed ? '' : item.name;
        if ('subItems' in item) {
          return (
            <SidebarWithSubItems
              key={item.id}
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
            key={item.id}
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
