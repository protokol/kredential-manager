import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-sky-900 border-transparent border-1.5 text-white enabled:hover:bg-sky-950 focus-visible:bg-sky-950 active:bg-sky-900 active:border-sky-950 disabled:text-slate-600 disabled:bg-slate-200 focus-visible:ring-slate-950',
        secondary:
          'bg-white border-1.5 text-sky-950 border-slate-400 enabled:hover:border-sky-900 enabled:hover:text-sky-950 disabled:text-slate-600 active:bg-white active:border-sky-950 disabled:bg-slate-200 disabled:border-none focus-visible:ring-slate-200',
        green:
          'border-transparent border-1.5 text-white bg-green-700 enabled:hover:bg-green-800 active:border-1.5 active:border-green-800 active:bg-green-700 disabled:text-slate-600 disabled:bg-slate-200 focus-visible:ring-green-200',
        red: 'border-1.5 border-transparent bg-red-700 text-white enabled:hover:bg-red-800 active:border-1.5 active:border-red-800 active:bg-red-700 disabled:text-slate-600 disabled:bg-slate-200 focus-visible:ring-red-200'
      },
      size: {
        default: 'h-9 px-3 py-2 gap-2 rounded',
        'icon-default': 'h-9 w-9 p-2.5 rounded-full',
        sm: 'gap-1.5 px-2 py-1 rounded text-xs',
        'icon-sm': 'p-1.5 h-6 w-6 rounded-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, type = 'button', asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;
