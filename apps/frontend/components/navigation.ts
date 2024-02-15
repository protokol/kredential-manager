import { createSharedPathnamesNavigation } from 'next-intl/navigation';

// eslint-disable-next-line no-restricted-imports -- We want to use `notFound` from `next/navigation`
export { notFound } from 'next/navigation';
export const locales = ['en', 'de'] as const;

export type SupportedLocale = (typeof locales)[number];
export const localePrefix = 'as-needed';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });
