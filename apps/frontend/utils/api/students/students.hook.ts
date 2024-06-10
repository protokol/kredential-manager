import {
  attachStudentToDid,
  createStudent,
  getStudents,
  updateVCStatus
} from './students.api';
import type {
  PaginatedResource,
  TAttachDidParams,
  TGetVCListParams,
  TStudentParams,
  TUpdateStatusParams,
  TVCredential
} from './students.type';
import type {
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

export const vcQueryKeys = {
  getStudents: 'getStudents',
  getVCCount: 'getVCCount'
};

export const useGetStudents = (
  params?: TGetVCListParams,
  config?: UseQueryOptions<PaginatedResource<TVCredential>>
) =>
  useQuery<PaginatedResource<TVCredential>>({
    queryFn: () => getStudents(params),
    queryKey: [vcQueryKeys.getStudents, { ...params }],
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
