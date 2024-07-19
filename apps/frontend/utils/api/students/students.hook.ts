import {
  attachStudentToDid,
  createStudent,
  getStudentById,
  getStudents,
  updateVCStatus
} from './students.api';
import type {
  PaginatedResource,
  TAttachDidParams,
  TGetVCListParams,
  TStudentParams,
  TUpdateStatusParams
} from './students.type';
import type {
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

export const vcQueryKeys = {
  getStudents: 'getStudents',
  getStudentById: 'getStudentById'
};

export const useGetStudents = (
  params?: TGetVCListParams,
  config?: UseQueryOptions<PaginatedResource<TStudentParams>>
) =>
  useQuery<PaginatedResource<TStudentParams>>({
    queryFn: () => getStudents(params),
    queryKey: [vcQueryKeys.getStudents, { ...params }],
    ...config
  });

export const useGetStudentById = (
  params: string,
  config?: UseQueryOptions<TStudentParams>
) =>
  useQuery<TStudentParams>({
    queryFn: () => getStudentById(params),
    queryKey: [vcQueryKeys.getStudentById, params],
    ...config
  });

export const useUpdateRequest = (
  config?: UseMutationOptions<unknown, unknown, TUpdateStatusParams>
) =>
  useMutation({
    mutationFn: updateVCStatus,
    ...config
  });

export const useAttachDid = (
  config?: UseMutationOptions<unknown, unknown, TAttachDidParams>
) =>
  useMutation({
    mutationFn: attachStudentToDid,
    ...config
  });

export const useCreateStudent = (
  config?: UseMutationOptions<unknown, unknown, TStudentParams>
) =>
  useMutation({
    mutationFn: createStudent,
    ...config
  });
