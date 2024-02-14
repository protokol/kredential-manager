import createMiddleware from 'next-intl/middleware';

import { localePrefix, locales } from '@navigation';

export default createMiddleware({
  localePrefix,
  locales,
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/(de|en)/:path*']
};
