/* eslint-disable @typescript-eslint/no-explicit-any */
import request from '@utils/configs/axios';

export const getSchemas = async (params?: any) =>
  request.get<any>('/schema-templates', { params }).then((res) => res.data);

export const createSchema = async (payload: any) =>
  request.post<any>('/schema-templates', payload).then((res) => res.data);

export const deleteSchema = async (id: string) =>
  request.delete<any>(`/schema-templates/${id}`).then((res) => res.data);
