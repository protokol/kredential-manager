'use client';

import { useMemo } from 'react';
import type { Control, FieldValues } from 'react-hook-form';
import { useFormState } from 'react-hook-form';

import type { ButtonProps } from '@ui/Button';
import Button from '@ui/Button';

type FormButtonProps<TFieldValues extends FieldValues> = ButtonProps & {
  control?: Control<TFieldValues>;
};

const FormButton = <TFieldValues extends FieldValues = FieldValues>({
  control,
  disabled,
  ...props
}: FormButtonProps<TFieldValues>) => {
  const { isValid, isSubmitting, isDirty } = useFormState<TFieldValues>({
    control
  });

  const buttonDisabled = useMemo(
    () => disabled || isSubmitting || !isDirty || !isValid,
    [disabled, isSubmitting, isDirty, isValid]
  );

  return <Button {...props} disabled={buttonDisabled} type='submit' />;
};

FormButton.displayName = 'FormButton';
export default FormButton;
