import type {
  PaginatedResource,
  TGetVCListParams,
  TVCredential
} from './credentials.type';

import request from '@utils/configs/axios';

export enum VCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum VCRole {
  STUDENT = 'student'
}

export const getVC = async (params?: TGetVCListParams) =>
  request
    .get<PaginatedResource<TVCredential>>('/verifiable-credentials', { params })
    .then((res) => res.data);
