import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { FC, HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

const titleVariants = cva('text-slate-800', {
  variants: {
    variant: {
      h1: 'text-3xl',
      h2: 'text-2xl',
      h3: 'text-xl',
      h4: 'text-lg'
    }
  }
});

export type TitleProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof titleVariants> & {
    asChild?: boolean;
  };

const Title: FC<TitleProps> = forwardRef<HTMLHeadingElement, TitleProps>(
  ({ variant = 'h1', className, children, asChild, ...props }, ref) => {
    const Component = asChild ? Slot : variant;

    if (!Component) return null;

    return (
      <Component
        ref={ref}
        className={cn(titleVariants({ variant, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Title.displayName = 'Title';

export default Title;
