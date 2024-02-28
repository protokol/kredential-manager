import { getVC } from './credentials.api';
import type {
  PaginatedResource,
  TGetVCListParams,
  TVCredential
} from './credentials.type';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export const vcQueryKeys = {
  getVC: 'getVC'
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
