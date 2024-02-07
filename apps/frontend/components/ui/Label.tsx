import type { LabelHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      {...props}
      ref={ref}
      className={cn('text-sm text-slate-500', className)}
    />
  )
);
Label.displayName = 'Label';

export default Label;
