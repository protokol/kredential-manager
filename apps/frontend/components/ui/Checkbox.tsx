'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

const checkboxVariants = cva(
  cn(
    'peer shrink-0 rounded border-1.5 border-slate-200 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70',
    'ring-slate-200 ring-offset-white focus:outline-none focus:ring-2 focus:ring-offset-2 data-[state=checked]:ring-green-600'
  ),
  {
    variants: {
      size: {
        small: 'h-4 w-4',
        normal: 'h-5 w-5'
      }
    },
    defaultVariants: {
      size: 'normal'
    }
  }
);

const checkboxIconVariants: typeof checkboxVariants = cva('stroke-2', {
  variants: {
    size: {
      small: 'h-3 w-3',
      normal: 'h-4 w-4'
    }
  },
  defaultVariants: {
    size: 'normal'
  }
});

export type CheckboxProps = ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> &
  VariantProps<typeof checkboxVariants>;

const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ size, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator asChild>
      <CheckIcon className={cn(checkboxIconVariants({ size }), 'text-white')} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';

export default Checkbox;
