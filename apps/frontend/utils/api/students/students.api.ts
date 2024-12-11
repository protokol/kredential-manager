/* eslint-disable */
import type {
  PaginatedResource,
  TAttachDidParams,
  TGetVCListParams,
  TStudentParams,
  TUpdateStatusParams,
  TVCCountList
} from './students.type';

import request from '@utils/configs/axios';

export const getStudents = async (params?: TGetVCListParams) =>
  request
    .get<PaginatedResource<any>>('/students', { params })
    .then((res) => res.data);

export const getStudentById = async (id: string) =>
  request.get<TStudentParams>(`/students/${id}`).then((res) => res.data);

export const updateVCStatus = async (payload: TUpdateStatusParams) => {
  const { id, status } = payload;
  return request
    .patch<TVCCountList>(`/verifiable-credentials/${id}/status`, { status })
    .then((res) => res.data);
};

export const attachStudentToDid = async (payload: TAttachDidParams) => {
  const { did, studentId } = payload;

  return request
    .post<any>(`/students/${studentId}/dids`, {
      identifier: did
    })
    .then((res) => res.data);
};

export const createStudent = async (payload: TStudentParams) => {
  return request.post<any>(`/students`, payload).then((res) => res.data);
};
