import request from '@utils/configs/axios';

export const getPrivate = async () =>
  // eslint-disable-next-line
  request.get('/private').then((res: any) => res.data);
