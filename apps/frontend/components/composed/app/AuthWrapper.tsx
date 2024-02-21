'use client';

import type { FC, PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { usePathname, useRouter } from '@navigation';

import { getAccessTokenFromStorage } from '@utils/api/auth/auth.utils';
import { routes } from '@utils/routes';

const AuthWrapper: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const token = getAccessTokenFromStorage();

    if (!token) {
      const queryParams = new URLSearchParams();
      queryParams.set('redirect', pathname);
      replace(`${routes.auth.signIn}?${queryParams.toString()}`);

      return;
    }

    setTokenValid(true);
  }, [pathname, replace, tokenValid]);

  return <>{tokenValid && children}</>;
};

export default AuthWrapper;
