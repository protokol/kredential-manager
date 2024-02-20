'use client';

import { jwtDecode } from 'jwt-decode';
// eslint-disable-next-line
import { useSearchParams } from 'next/navigation';
import type { FC, PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

import { useRouter } from '@navigation';

import {
  getAccessTokenFromStorage,
  removeTokensFromStorage,
  saveTokensToStorage
} from '@utils/api/auth/auth.utils';
import { routes } from '@utils/routes';

type TUser = {
  name: string;
};

type TAuthContext = {
  user?: TUser;
  logout: () => void;
  login: (accessToken: string, refreshToken: string) => void;
};
export const AuthContext = createContext<TAuthContext>({
  user: undefined,
  login: () => {},
  logout: () => {}
});

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState({ name: '' });

  const { push } = useRouter();
  const params = useSearchParams();

  const updateUser = useCallback(
    (jwt: string) => {
      if (jwt) {
        const decodedToken = jwtDecode(jwt);
        // eslint-disable-next-line
        const { name } = decodedToken as any;

        setUser({ ...user, name });
      }
    },
    [user]
  );

  useEffect(() => {
    const jwt = getAccessTokenFromStorage();
    updateUser(jwt);
    // eslint-disable-next-line
  }, []);

  const handleLogin = (accessToken: string, refreshToken: string) => {
    saveTokensToStorage(accessToken, refreshToken);

    updateUser(accessToken);

    const redirect = params.get('redirect') || routes.app.home;

    push(redirect);
  };

  const handleLogout = () => {
    removeTokensFromStorage();

    push(routes.auth.signIn);

    setUser({ name: '' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
