import createMiddleware from 'next-intl/middleware';

import { localePrefix, locales } from '@navigation';

export default createMiddleware({
  localePrefix,
  locales,
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/', '/(de|en)/:path*']
};
