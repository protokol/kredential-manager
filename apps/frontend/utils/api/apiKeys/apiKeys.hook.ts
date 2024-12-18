/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApiKey, deleteApiKey, getApiKeys } from './apiKeys.api';
import type {
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

export const apiKeysQueryKeys = {
  getApiKeys: 'getApiKeys'
};

export const useGetApiKeys = (params?: any, config?: UseQueryOptions<any>) =>
  useQuery<any>({
    queryFn: () => getApiKeys(params),
    queryKey: [apiKeysQueryKeys.getApiKeys, { ...params }],
    ...config
  });

export const useCreateApiKey = (
  config?: UseMutationOptions<any, unknown, any>
) =>
  useMutation({
    mutationFn: createApiKey,
    ...config
  });

export const useDeleteApiKey = (
  config?: UseMutationOptions<any, unknown, any>
) =>
  useMutation({
    mutationFn: deleteApiKey,
    ...config
  });
