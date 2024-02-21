import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

import { refreshAccessToken } from '@utils/api/auth/auth.api';
import {
  getAccessTokenFromStorage,
  getRefreshTokenFromStorage,
  setAccessTokenToStorage
} from '@utils/api/auth/auth.utils';

// TODO change the url to our api
const request: AxiosInstance = axios.create({
  baseURL: 'https://api.example.com'
});

export const setAccessToken = (accessToken: string | null) => {
  if (accessToken) {
    request.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  } else {
    delete request.defaults.headers.common['Authorization'];
  }
};

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
      }
    }

    return Promise.reject(error);
  }
);

export default request;
