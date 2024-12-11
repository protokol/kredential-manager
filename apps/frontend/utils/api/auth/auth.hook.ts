import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import { signIn } from '@utils/api/auth/auth.api';
import type { TSignInPayload } from '@utils/api/auth/auth.type';

type TSigninResponse = {
  access_token: string;
  refresh_token: string;
};

export const useSignIn = (
  config?: UseMutationOptions<TSigninResponse, unknown, TSignInPayload>
) =>
  useMutation<TSigninResponse, unknown, TSignInPayload>({
    mutationFn: signIn,
    ...config
  });
