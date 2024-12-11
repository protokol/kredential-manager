type ConfigTypes = {
  baseUrl: string;
  isProduction: boolean;
};

export const env: ConfigTypes = {
  baseUrl: 'https://test.com/',
  isProduction: process.env.NODE_ENV === 'production'
};
