import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

const CenterLayout = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn('w-full md:mx-auto md:max-w-screen-2xl', className)}
    >
      {children}
    </div>
  )
);

CenterLayout.displayName = 'CenterLayout';

export default CenterLayout;
