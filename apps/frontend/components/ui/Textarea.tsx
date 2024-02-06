import { type VariantProps, cva } from 'class-variance-authority';
import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const textareaVariants = cva(
  'border-1.5 w-full resize-y rounded border-slate-200 bg-white px-4 py-2 text-sm text-sky-950 ring-slate-200 ring-offset-white focus:outline-none focus:ring-2 focus:ring-offset-2 placeholder:text-slate-500 hover:border-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:placeholder:text-slate-400',
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

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps & VariantProps<typeof textareaVariants>
>(({ className, variant, ...props }, ref) => (
  <textarea
    className={cn(textareaVariants({ variant, className }))}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export default Textarea;
