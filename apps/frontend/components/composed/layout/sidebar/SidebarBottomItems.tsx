'use client';

import {
  ArrowLeftOnRectangleIcon,
  ChevronDoubleLeftIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Slot } from '@radix-ui/react-slot';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { FC, HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';
import { routes } from '@utils/routes';

import PlaceholderAvatar from '@ui/PlaceholderAvatar';
import Text from '@ui/typography/Text';

type SidebarBottomItemsProps = {
  sidebarCollapsed: boolean;
  toggleSidebar?: (state?: boolean) => void;
};
const SidebarBottomItems: FC<SidebarBottomItemsProps> = ({
  sidebarCollapsed,
  toggleSidebar
}) => {
  const t = useTranslations();
  return (
    <div className='space-y-2'>
      <div
        className={cn(
          'flex cursor-pointer items-center gap-2 hover:opacity-80',
          {
            'justify-center': sidebarCollapsed,
            'pl-0.5': !sidebarCollapsed
          }
        )}
      >
        <PlaceholderAvatar className='h-9 w-9 flex-shrink-0' />

        {!sidebarCollapsed && <Text className='truncate'>Gratian</Text>}
      </div>

      <BottomSidebarItem
        className={cn({
          'justify-center': sidebarCollapsed
        })}
      >
        <QuestionMarkCircleIcon className='h-6 w-6 shrink-0' />
        {!sidebarCollapsed && (
          <span className='truncate'>{t('navigation.help')}</span>
        )}
      </BottomSidebarItem>

      <BottomSidebarItem
        asChild
        className={cn({
          'justify-center': sidebarCollapsed
        })}
      >
        <Link href={routes.auth.signOut}>
          <ArrowLeftOnRectangleIcon className='h-6 w-6 shrink-0' />
          {!sidebarCollapsed && <span>{t('navigation.sign_out')}</span>}
        </Link>
      </BottomSidebarItem>

      {toggleSidebar && (
        <button
          onClick={() => {
            toggleSidebar(!sidebarCollapsed);
          }}
        >
          <BottomSidebarItem
            className={cn('inline-flex text-sky-950 hover:text-white', {
              'justify-center': sidebarCollapsed
            })}
          >
            <ChevronDoubleLeftIcon
              className={cn('h-6 w-6', {
                '-rotate-180': sidebarCollapsed
              })}
            />
          </BottomSidebarItem>
        </button>
      )}
    </div>
  );
};

export default SidebarBottomItems;

type BottomSidebarItemProps = HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

const BottomSidebarItem = forwardRef<HTMLDivElement, BottomSidebarItemProps>(
  ({ className, asChild, ...rest }, ref) => {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        ref={ref}
        className={cn(
          'group flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm font-medium text-sky-950 transition-colors hover:bg-sky-950 hover:text-white',
          className
        )}
        {...rest}
      />
    );
  }
);

BottomSidebarItem.displayName = 'BottomSidebarItem';
