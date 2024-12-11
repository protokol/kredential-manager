import { createOffer } from './offers.api';
import type { TOfferParams } from './offers.type';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

export const useCreateOffer = (
  config?: UseMutationOptions<unknown, unknown, TOfferParams>
) =>
  useMutation({
    mutationFn: createOffer,
    ...config
  });
