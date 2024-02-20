'use client';

import { Slot } from '@radix-ui/react-slot';
import type {
  ComponentPropsWithoutRef,
  ElementRef,
  HTMLAttributes
} from 'react';
import { forwardRef, useId } from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { Controller, FormProvider } from 'react-hook-form';

import { cn } from '@utils/cn';

import type { LabelProps } from '@ui/Label';
import Label from '@ui/Label';
import useFormField, {
  FormFieldContext,
  FormItemContext
} from '@ui/form/useFormField';

/**
 * Form usage example:
 * @example
 *  const formSchema = z.object({})
 *   type FormValues = z.infer<typeof formSchema>;
 *
 *   const form = useForm<FormValues>({
 *     resolver: zodResolver(formSchema),
 *     defaultValues: {
 *       username: '',
 *       note: ''
 *     }
 *   });
 *
 *   return (
 *    <FormRoot {...form}>
 *       <form onSubmit={form.handleSubmit(console.log)}>
 *         <FormInputField name='username' control={form.control} />
 *         <FormTextareaField name='note' control={form.control} />
 *         <button type='submit'>Submit</button>
 *       </form>
 *     </FormRoot>
 *     )
 */

const FormControl = forwardRef<
  ElementRef<typeof Slot>,
  ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

const FormErrorMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-xs text-red-600', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormErrorMessage.displayName = 'FormErrorMessage';

const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

type FormLabelProps = LabelProps & {
  required?: boolean;
  tooltip?: string;
};
const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, tooltip, ...props }, ref) => {
    const { formItemId } = useFormField();

    return (
      <span className={cn('inline-flex items-center gap-1')}>
        <Label ref={ref} htmlFor={formItemId} {...props} />
        {required && <span className='text-red-600'>*</span>}
      </span>
    );
  }
);
FormLabel.displayName = 'FormLabel';

export {
  FormProvider as FormRoot,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormErrorMessage
};
