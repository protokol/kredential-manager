import { type VariantProps } from 'class-variance-authority';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

import type { inputVariants } from '@ui/Input';
import Input from '@ui/Input';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

type TInputWithIcon = {
  icon?: React.ElementType;
};

const InputWithIcon = forwardRef<
  HTMLInputElement,
  TInputWithIcon & InputProps & VariantProps<typeof inputVariants>
>(({ className, type, icon, ...props }, ref) => {
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
        className={cn('pl-10', className)}
      />
    </div>
  );
});
InputWithIcon.displayName = 'InputWithIcon';

export default InputWithIcon;
