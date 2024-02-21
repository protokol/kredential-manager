export const getAccessTokenFromStorage = () =>
  sessionStorage.getItem('accessToken') || '';

export const getRefreshTokenFromStorage = () =>
  localStorage.getItem('refreshToken');

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
