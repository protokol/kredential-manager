import { NextIntlClientProvider } from 'next-intl';

import { notFound } from '@navigation';

import DeviceScreenWrapper from '@components/composed/DeviceScreenWrapper';
import NotificationsProvider from '@components/composed/NotificationsProvider';
import { PaginationProvider } from '@components/composed/PaginationProvider';
import ReactQueryProvider from '@components/composed/ReactQueryProvider';
import AuthProvider from '@components/composed/auth/AuthProvider';

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages(locale);
  return (
    <NextIntlClientProvider messages={messages}>
      <ReactQueryProvider>
        <DeviceScreenWrapper>
          <AuthProvider>
            <PaginationProvider>
              <NotificationsProvider>{children}</NotificationsProvider>
            </PaginationProvider>
          </AuthProvider>
        </DeviceScreenWrapper>
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}
