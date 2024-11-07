import type { AxiosResponse } from 'axios';
import axios from 'axios';

import type { TSignInPayload } from '@utils/api/auth/auth.type';
import { removeTokensFromStorage } from '@utils/api/auth/auth.utils';
import { setAccessToken } from '@utils/configs/axios';

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;
const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_AUTH_CLIENT_SECRET;
const authHeaders = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

export const refreshAccessToken = async (
  refreshToken: string | null
): Promise<string | undefined | null> => {
  if (!refreshToken) return null;

  try {
    const refresh_token_url = `${KEYCLOAK_URL}/token`;
    const response: AxiosResponse = await axios.post(
      refresh_token_url,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      },
      { ...authHeaders }
    );

    const newAccessToken: string = response.data.access_token;
    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    removeTokensFromStorage();
    window.location.href = '/auth/sign-in';
  }
};

export const signIn = async (credentials: TSignInPayload) => {
  const { username, password } = credentials;
  try {
    const sign_in_url = `${KEYCLOAK_URL}/token`;
    const response: AxiosResponse = await axios.post(
      sign_in_url,
      {
        grant_type: 'password',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username,
        password
      },
      { ...authHeaders }
    );

    const { access_token, refresh_token } = response.data;
    setAccessToken(access_token);
    return { access_token, refresh_token };
  } catch (error) {
    throw error;
  }
};
