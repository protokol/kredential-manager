import {
  getVC,
  getVCById,
  getVCCount,
  updateVCStatus
} from './credentials.api';
import type {
  PaginatedResource,
  TGetVCListParams,
  TUpdateStatusParams,
  TVCCountList,
  TVCredential
} from './credentials.type';
import type {
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

export const vcQueryKeys = {
  getVC: 'getVC',
  getVCCount: 'getVCCount',
  getVCById: 'getVCById'
};

export const useGetVC = (
  params?: TGetVCListParams,
  config?: UseQueryOptions<PaginatedResource<TVCredential>>
) =>
  useQuery<PaginatedResource<TVCredential>>({
    queryFn: () => getVC(params),
    queryKey: [vcQueryKeys.getVC, { ...params }],
    ...config
  });

export const useGetVCById = (
  params: string,
  config?: UseQueryOptions<TVCredential>
) =>
  useQuery<TVCredential>({
    queryFn: () => getVCById(params),
    queryKey: [vcQueryKeys.getVCById, params],
    ...config
  });

export const useGetVCCount = (
  params?: TGetVCListParams,
  config?: UseQueryOptions<TVCCountList>
) =>
  useQuery<TVCCountList>({
    queryFn: () => getVCCount(),
    queryKey: [vcQueryKeys.getVCCount, { ...params }],
    enabled: false,
    ...config
  });

export const useUpdateRequest = (
  config?: UseMutationOptions<unknown, unknown, TUpdateStatusParams>
) =>
  useMutation({
    mutationFn: updateVCStatus,
    ...config
  });
