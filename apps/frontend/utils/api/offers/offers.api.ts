/* eslint-disable @typescript-eslint/no-explicit-any */
import request from '@utils/configs/axios';

export const getOffers = async (params?: any) =>
  request.get<any>('/offer', { params }).then((res) => res.data);

export const createOffer = async (payload: any) =>
  request.post<any>('/offer', payload).then((res) => res.data);

export const deleteOffer = async (id: string) =>
  request.delete<any>(`/offer/${id}`).then((res) => res.data);

export const getOfferById = async (id: string) =>
  request.get<any>(`/offer/${id}`).then((res) => res.data);
