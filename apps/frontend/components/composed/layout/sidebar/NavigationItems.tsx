'use client';

import {
  AcademicCapIcon,
  AdjustmentsVerticalIcon,
  Cog8ToothIcon,
  DocumentIcon,
  DocumentTextIcon,
  HomeIcon,
  KeyIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { usePathname } from '@navigation';

import { routes } from '@utils/routes';

import { useNotifications } from '@components/composed/NotificationsProvider';
import SidebarItem, {
  SidebarWithSubItems
} from '@components/ui/sidebar/SidebarItem';

type TNavigationLink = {
  name: string;
  href: string;
  icon?: FC;
  locked?: boolean;
  notifications?: string;
};

export type TNavigationButtonWithSubItems = {
  name: string;
  icon: FC<{ className?: string }>;
  subItems: TNavigationLink[];
  match: string;
  href?: string;
  sidebarCollapsed?: boolean;
  locked?: boolean;
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
  const { pending } = useNotifications();

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
            notifications: pending
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
        id: 'apiKeys',
        name: t('navigation.api_keys'),
        href: routes.app.apiKeys.home,
        icon: KeyIcon
      },
      {
        id: 'schemaTemplates',
        name: t('navigation.schemaTemplates'),
        href: routes.app.schemaTemplates.home,
        icon: DocumentIcon
      },
      {
        id: 'offers',
        name: t('navigation.offers'),
        href: routes.app.offers.home,
        icon: AcademicCapIcon
      },
      {
        id: 'interoperability',
        name: t('navigation.interoperability'),
        href: routes.app.interoperability.home,
        icon: DocumentTextIcon
      },
      {
        id: 'integrations',
        name: t('navigation.integrations'),
        match: routes.app.integrations.home,
        icon: AdjustmentsVerticalIcon,
        locked: true,
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
        locked: true,
        subItems: [
          {
            id: 'admin-users',
            name: t('navigation.users'),
            href: routes.app.admin.users.home
          }
        ]
      }
    ],
    [t, pending]
  );

  return (
    <div className='flex-grow space-y-1'>
      {navigationItems.map((item) => {
        const itemName = sidebarCollapsed ? '' : item.name;
        if ('subItems' in item && !item.locked) {
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
            locked={item.locked}
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
