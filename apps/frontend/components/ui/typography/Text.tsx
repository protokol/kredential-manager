import { Slot } from '@radix-ui/react-slot';
import type { FC, HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

type TextProps = HTMLAttributes<HTMLHeadingElement> & {
  asChild?: boolean;
};

const Text: FC<TextProps> = forwardRef<HTMLHeadingElement, TextProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const Component = asChild ? Slot : 'div';

    if (!Component) return null;

    return (
      <Component
        ref={ref}
        className={cn('text-slate-800', className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export default Text;
