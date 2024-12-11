'use client';

import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { useGetVCCount } from '@utils/api/credentials/credentials.hook';
import { VCStatus } from '@utils/api/credentials/credentials.type';
import type { TVCCount } from '@utils/api/credentials/credentials.type';

import { useAuth } from '@components/composed/auth/AuthProvider';

type TNotifications = {
  pending?: string;
  overall?: string;
};

export const NotificationsContext = createContext<TNotifications>({
  pending: '',
  overall: ''
});

const ONE_MINUTE_DEBOUNCE_TIMER = 60000;

const NotificationsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [pending, setPending] = useState('');
  const [overall, setOverall] = useState('');

  const { user } = useAuth();
  const { data, refetch } = useGetVCCount();

  useEffect(() => {
    if (data && user?.name) {
      const { count } = data;

      const pendingNotifications = count.find(
        (el: TVCCount) => el?.status === VCStatus.PENDING
      );

      const totalNotifications = count?.reduce(
        (acc, el) => (acc += Number(el?.count)),
        0
      );

      setOverall(String(totalNotifications));

      if (pendingNotifications) {
        setPending(pendingNotifications.count);
      }
    }
  }, [data, user?.name]);

  useEffect(() => {
    if (user?.name) {
      refetch();

      const interval = setInterval(refetch, ONE_MINUTE_DEBOUNCE_TIMER);

      return () => clearInterval(interval);
    }
  }, [refetch, user?.name]);

  return (
    <NotificationsContext.Provider
      value={{
        pending,
        overall
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;

export const useNotifications = () => useContext(NotificationsContext);
