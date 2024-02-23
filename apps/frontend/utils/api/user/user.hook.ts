import { getPrivate } from './user.api';
import { useQuery } from '@tanstack/react-query';

export const useGetPrivate = () =>
  // eslint-disable-next-line
  useQuery<any>({
    queryFn: () => getPrivate(),
    queryKey: ['getPrivate'],
    enabled: false
  });
