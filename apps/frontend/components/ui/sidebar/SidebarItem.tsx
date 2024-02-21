'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Dialog from '@radix-ui/react-dialog';
import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';
import { useCallback } from 'react';

import { Link, usePathname } from '@navigation';

import { cn } from '@utils/cn';

import type { TNavigationButtonWithSubItems } from '@components/composed/layout/sidebar/NavigationItems';

type SidebarWithSubItemsProps = TNavigationButtonWithSubItems & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
export const SidebarWithSubItems: FC<SidebarWithSubItemsProps> = ({
  open,
  onOpenChange,
  icon: Icon,
  sidebarCollapsed,
  name,
  subItems,
  match
}) => {
  const pathname = usePathname();

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={onOpenChange}
      className='space-y-1'
    >
      <Collapsible.Trigger asChild>
        <SidebarItem
          icon={Icon}
          name={name}
          asTrigger
          sidebarCollapsed={sidebarCollapsed}
          open={open}
          active={!open && pathname?.startsWith(match)}
        />
      </Collapsible.Trigger>

      <Collapsible.Content className="space-y-1 overflow-y-hidden data-[state='closed']:animate-radix-collapse-slide-up data-[state='open']:animate-radix-collapse-slide-down">
        {subItems.map((subItem) => (
          <SidebarSubItem
            key={subItem.name}
            name={subItem.name}
            notifications={subItem.notifications}
            href={subItem.href}
            className={cn({
              'bg-sky-950': pathname.startsWith(subItem.href),
              'text-white': pathname.startsWith(subItem.href)
            })}
          />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

type SidebarSubItemProps = {
  name: string;
  href: string;
  className?: string;
  notifications?: number;
};
const SidebarSubItem: FC<SidebarSubItemProps> = ({
  name,
  href,
  className,
  notifications
}) => (
  <Link
    href={href}
    className={cn(
      'flex w-full items-center justify-between gap-3 rounded-lg py-2.5 pl-11 pr-3 text-sm transition-colors hover:bg-sky-950 hover:text-white',
      className
    )}
  >
    {name}
    {notifications && (
      <span className='min-w-6 rounded-md bg-red-700 p-1 text-center text-xs text-white'>
        {notifications}
      </span>
    )}
  </Link>
);

type SidebarItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: FC<{
    className?: string;
  }>;
  name: string;
  href?: string;
  active?: boolean;
  asDialog?: boolean;
  sidebarCollapsed?: boolean;
  open?: boolean;
  asTrigger?: boolean;
};
const SidebarItem: FC<SidebarItemProps> = ({
  icon: Icon,
  name,
  active,
  className,
  href,
  asDialog,
  asTrigger,
  open,
  sidebarCollapsed,
  ...props
}) => {
  const classes = cn(
    'flex w-full items-center justify-between gap-3 rounded-lg py-2 pl-2 pr-3 text-sm font-medium transition-colors',
    'text-sky-950 hover:bg-sky-950 hover:text-white',
    'outline-none focus:ring-2 focus:ring-sky-950',
    {
      'bg-sky-950': active,
      'text-white': active
    },
    className
  );

  const WrapperComponent = useCallback(
    ({ children }: PropsWithChildren) => {
      if (asDialog) {
        return <Dialog.Trigger asChild>{children}</Dialog.Trigger>;
      }

      return <>{children}</>;
    },
    [asDialog]
  );

  if (href) {
    return (
      <WrapperComponent>
        <Link className={classes} href={href}>
          <div className='flex items-center gap-3'>
            {Icon && <Icon className='h-6 w-6 flex-shrink-0' />}
            <span className='truncate'>{name}</span>
          </div>

          {asTrigger && (
            <ChevronDownIcon className='h-4 w-4 flex-shrink-0 text-white' />
          )}
        </Link>
      </WrapperComponent>
    );
  }

  return (
    <WrapperComponent>
      <button {...props} className={classes}>
        <div className='flex items-center gap-3'>
          {Icon && <Icon className='h-6 w-6 shrink-0' />}
          <span className='truncate'>{name}</span>
        </div>

        {asTrigger && !sidebarCollapsed && (
          <ChevronDownIcon
            className={cn('h-4 w-4 flex-shrink-0', {
              'rotate-180': open
            })}
          />
        )}
      </button>
    </WrapperComponent>
  );
};
export default SidebarItem;
