'use client';

import { useAuth } from './AuthProvider';
import {
  ArrowPathIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { useSignIn } from '@utils/api/auth/auth.hook';
import { toastError, toastSuccess } from '@utils/toast';

import InputWithIcon from '@ui/InputWithIcon';
import { FormRoot } from '@ui/form/Form.components';
import FormButton from '@ui/form/FormButton';

const SignInForm = () => {
  const t = useTranslations();

  const { login } = useAuth();

  const { mutateAsync: signIn, isPending: isSubmitting, isError } = useSignIn();

  const formSchema = z.object({
    email: z.string().trim().nonempty(),
    password: z.string().trim().nonempty()
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { register, handleSubmit } = form;

  const handleSignIn = useCallback(
    async (values: FormValues) => {
      try {
        const { access_token, refresh_token } = await signIn({
          username: values.email,
          password: values.password
        });

        login(access_token, refresh_token);

        toastSuccess({
          text: t('sign_in_page.sign_in_success')
        });
      } catch (e) {
        toastError({
          text: t('sign_in_page.sign_in_error')
        });
      }
    },
    [signIn, login, t]
  );

  return (
    <FormRoot {...form}>
      <form onSubmit={handleSubmit(handleSignIn)}>
        <div className='mt-2.5'>
          <InputWithIcon
            type='email'
            variant={isError ? 'error' : 'primary'}
            {...register('email')}
            icon={EnvelopeIcon}
            autoComplete='off'
            placeholder={t('sign_in_page.email_placeholder')}
          />
        </div>
        <div className='mt-2.5'>
          <InputWithIcon
            type='password'
            variant={isError ? 'error' : 'primary'}
            {...register('password')}
            icon={LockClosedIcon}
            autoComplete='off'
            placeholder={t('sign_in_page.password_placeholder')}
          />
        </div>

        <FormButton
          variant='primary'
          className='group mt-5 w-full'
          disabled={isSubmitting}
          control={form.control}
        >
          {isSubmitting && (
            <ArrowPathIcon className='h-4 w-4 animate-spin-infinite' />
          )}
          {isSubmitting
            ? t('sign_in_page.signing_in')
            : t('sign_in_page.sign_in')}
        </FormButton>
      </form>
    </FormRoot>
  );
};

export default SignInForm;
