import { getVC, getVCCount } from './credentials.api';
import type {
  PaginatedResource,
  TGetVCListParams,
  TVCCountList,
  TVCredential
} from './credentials.type';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export const vcQueryKeys = {
  getVC: 'getVC',
  getVCCount: 'getVCCount'
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
