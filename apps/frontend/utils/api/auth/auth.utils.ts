export const getAccessTokenFromStorage = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('accessToken');
  }
  return null;
};

export const getRefreshTokenFromStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const setAccessTokenToStorage = (accessToken: string) => {
  sessionStorage.setItem('accessToken', accessToken);
};

export const saveTokensToStorage = (
  accessToken: string,
  refreshToken: string
) => {
  sessionStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const removeTokensFromStorage = () => {
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
