import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

import { refreshAccessToken } from '@utils/api/auth/auth.api';
import {
  getAccessTokenFromStorage,
  getRefreshTokenFromStorage,
  removeTokensFromStorage,
  setAccessTokenToStorage
} from '@utils/api/auth/auth.utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
const request: AxiosInstance = axios.create({
  baseURL: BASE_URL
});

export const setAccessToken = (accessToken: string | null) => {
  if (accessToken) {
    request.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  } else {
    delete request.defaults.headers.common['Authorization'];
  }
};

const initialAccessToken = getAccessTokenFromStorage();
setAccessToken(initialAccessToken);

request.interceptors.request.use(
  (config) => {
    const accessToken = getAccessTokenFromStorage();
    setAccessToken(accessToken);
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshTokenFromStorage();
      const newAccessToken = await refreshAccessToken(refreshToken);

      if (newAccessToken) {
        setAccessTokenToStorage(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return request(originalRequest);
      } else {
        removeTokensFromStorage();
        window.location.href = '/auth/sign-in';
      }
    }

    return Promise.reject(error);
  }
);

export default request;
