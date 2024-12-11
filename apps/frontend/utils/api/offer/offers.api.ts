/* eslint-disable */
import type { PaginatedResource, TOfferParams } from './offers.type';

import request from '@utils/configs/axios';

export const getOffers = async (params?: any) =>
  request
    .get<PaginatedResource<any>>('/offer', { params })
    .then((res) => res.data);

export const getOfferById = async (id: string) =>
  request.get<TOfferParams>(`/offer/${id}`).then((res) => res.data);

export const createOffer = async (payload: TOfferParams) => {
  return request.post<any>(`/offer`, payload).then((res) => res.data);
};
