import type {
  PaginatedResource,
  TGetVCListParams,
  TUpdateStatusParams,
  TVCCountList,
  TVCredential
} from './credentials.type';

import request from '@utils/configs/axios';

export const getVC = async (params?: TGetVCListParams) =>
  request
    .get<PaginatedResource<TVCredential>>('/verifiable-credentials', { params })
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
