/* eslint-disable @typescript-eslint/no-explicit-any */
import request from '@utils/configs/axios';

export const getApiKeys = async (params?: any) =>
  request.get<any>('/api-keys', { params }).then((res) => res.data);

export const createApiKey = async (payload: any) =>
  request.post<any>('/api-keys', payload).then((res) => res.data);

export const deleteApiKey = async (id: string) =>
  request.delete<any>(`/api-keys/${id}`).then((res) => res.data);
