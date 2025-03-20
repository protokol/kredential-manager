import type { Credential } from './interop.type';

import request from '@utils/configs/axios';

export const getInteropCredentials = async (holderDid: string) =>
  request
    .post<Credential[]>('/interop/credentials', { holderDid })
    .then((res) => res.data);
