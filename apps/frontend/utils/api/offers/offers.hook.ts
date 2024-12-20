/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createOffer,
  deleteOffer,
  getOfferById,
  getOffers
} from './offers.api';
import type {
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

export const offersQueryKeys = {
  getOffers: 'getOffers',
  getOffer: 'getOffer'
};

export const useOffers = (params?: any, config?: UseQueryOptions<any[]>) =>
  useQuery<any[]>({
    queryFn: () => getOffers(params),
    queryKey: [offersQueryKeys.getOffers, { ...params }],
    ...config
  });

export const useCreateOffer = (
  config?: UseMutationOptions<any, unknown, Partial<any>>
) =>
  useMutation({
    mutationFn: createOffer,
    ...config
  });

export const useDeleteOffer = (
  config?: UseMutationOptions<void, unknown, string>
) =>
  useMutation({
    mutationFn: deleteOffer,
    ...config
  });

export const useOffer = (id: string, config?: UseQueryOptions<any>) =>
  useQuery<any>({
    queryFn: () => getOfferById(id),
    queryKey: [offersQueryKeys.getOffer, id],
    ...config
  });
