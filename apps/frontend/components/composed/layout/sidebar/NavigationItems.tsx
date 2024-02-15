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

type TNavigationItem = TNavigationLink | TNavigationButtonWithSubItems;

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
        name: t('navigation.dashboard'),
        icon: HomeIcon,
        href: routes.app.home
      },
      {
        name: t('navigation.credentials'),
        icon: DocumentTextIcon,
        match: routes.app.credentials.home,
        subItems: [
          {
            name: t('navigation.overall'),
            href: routes.app.credentials.overall.home
          },
          {
            name: t('navigation.approved'),
            href: routes.app.credentials.approved.home
          },
          {
            name: t('navigation.pending'),
            href: routes.app.credentials.pending.home,
            notifications: 70
          },
          {
            name: t('navigation.rejected'),
            href: routes.app.credentials.rejected.home
          }
        ]
      },
      {
        name: t('navigation.students'),
        href: routes.app.students.home,
        icon: UsersIcon
      },
      {
        name: t('navigation.integrations'),
        match: routes.app.integrations.home,
        icon: AdjustmentsVerticalIcon,
        subItems: [
          {
            name: t('navigation.sources'),
            href: routes.app.integrations.sources.home
          }
        ]
      },
      {
        name: t('navigation.admin'),
        href: routes.app.admin.home,
        icon: Cog8ToothIcon,
        subItems: [
          {
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
