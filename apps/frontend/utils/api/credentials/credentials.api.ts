import type {
  PaginatedResource,
  TUpdateStatusParams,
  TVCCountList,
  TVCredential
} from './credentials.type';

import request from '@utils/configs/axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getVC = async (params?: any) => {
  const { sortBy } = params;
  if (sortBy) {
    const [first, second] = sortBy.split('.');
    params.sort = `${first}:${second}`;
  }

  return request
    .get<PaginatedResource<TVCredential>>('/verifiable-credentials', { params })
    .then((res) => res.data);
};

export const getVCById = async (id: string) =>
  request
    .get<TVCredential>(`/verifiable-credentials/${id}`)
    .then((res) => res.data);

export const getVCCount = async () =>
  request
    .get<TVCCountList>('/verifiable-credentials/count')
    .then((res) => res.data);

export const updateVCStatus = async (payload: TUpdateStatusParams) => {
  const { id, status } = payload;
  return request
    .patch<TVCCountList>(`/verifiable-credentials/${id}/status`, { status })
    .then((res) => res.data);
};
