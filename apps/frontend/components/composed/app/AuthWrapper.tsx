'use client';

import { useAuth } from '../auth/AuthProvider';
import type { FC, PropsWithChildren } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { usePathname, useRouter } from '@navigation';

import { refreshAccessToken } from '@utils/api/auth/auth.api';
import {
  getAccessTokenFromStorage,
  getRefreshTokenFromStorage,
  setAccessTokenToStorage
} from '@utils/api/auth/auth.utils';
import { routes } from '@utils/routes';

const AuthWrapper: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const [tokenValid, setTokenValid] = useState(false);

  const { updateUser } = useAuth();

  const redirectToSignIn = useCallback(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('redirect', pathname);
    replace(`${routes.auth.signIn}?${queryParams.toString()}`);
  }, [pathname, replace]);

  const getRefreshToken = useCallback(async () => {
    const refreshToken = getRefreshTokenFromStorage();

    if (!refreshToken) {
      redirectToSignIn();
      return;
    }

    const newRefreshToken = await refreshAccessToken(refreshToken);
    if (newRefreshToken) {
      setAccessTokenToStorage(newRefreshToken);
      updateUser(newRefreshToken);
      setTokenValid(true);
    }
  }, [redirectToSignIn, updateUser]);

  useEffect(() => {
    const accessToken = getAccessTokenFromStorage();
    const refreshToken = getRefreshTokenFromStorage();

    if (!accessToken) {
      getRefreshToken();
    } else if (!refreshToken && accessToken) {
      redirectToSignIn();
    } else {
      setTokenValid(true);
    }
  }, [pathname, replace, getRefreshToken, redirectToSignIn]);

  return <>{tokenValid && children}</>;
};

export default AuthWrapper;
