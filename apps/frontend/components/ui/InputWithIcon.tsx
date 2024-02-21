import { type VariantProps, cva } from 'class-variance-authority';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

import Input from '@ui/Input';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const inputVariants = cva(
  'border-1.5 w-full rounded border-slate-200 bg-white px-4 py-2 text-sm text-sky-950 ring-slate-200 ring-offset-white focus:outline-none placeholder:text-slate-500 hover:border-slate-200 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:placeholder:text-slate-500',
  {
    variants: {
      variant: {
        primary: 'border-none',
        success:
          'border-green-600 focus:border-green-600 hover:border-green-600',
        error: 'border-red-700 focus:border-red-700 hover:border-red-700'
      },
      defaultVariants: {
        variant: 'primary'
      }
    }
  }
);

type TInputWithIcon = {
  icon?: React.ElementType;
};

const InputWithIcon = forwardRef<
  HTMLInputElement,
  TInputWithIcon & InputProps & VariantProps<typeof inputVariants>
>(({ className, type, variant, icon, ...props }, ref) => {
  const Icon = icon;

  return (
    <div className='relative'>
      {Icon && (
        <Icon className='absolute left-3 top-1/2 h-auto w-5 -translate-y-1/2 transform text-slate-500' />
      )}
      <Input
        {...props}
        ref={ref}
        type={type}
        className={cn('pl-9', inputVariants({ variant, className }), {
          'pl-9': !!icon
        })}
      />
    </div>
  );
});
InputWithIcon.displayName = 'InputWithIcon';

export default InputWithIcon;
