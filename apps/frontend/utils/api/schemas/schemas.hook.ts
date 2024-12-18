/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSchema, deleteSchema, getSchemas } from './schemas.api';
import type {
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

export const schemasQueryKeys = {
  getSchemas: 'getSchemas'
};

export const useSchemas = (params?: any, config?: UseQueryOptions<any>) =>
  useQuery<any>({
    queryFn: () => getSchemas(params),
    queryKey: [schemasQueryKeys.getSchemas, { ...params }],
    ...config
  });

export const useCreateSchema = (
  config?: UseMutationOptions<any, unknown, any>
) =>
  useMutation({
    mutationFn: createSchema,
    ...config
  });

export const useDeleteSchema = (
  config?: UseMutationOptions<any, unknown, any>
) =>
  useMutation({
    mutationFn: deleteSchema,
    ...config
  });
