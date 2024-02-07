import { XCircleIcon } from '@heroicons/react/24/outline';
import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

export type FilterClearButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};
const FilterClearButton = forwardRef<HTMLButtonElement, FilterClearButtonProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(
          'flex items-center gap-1 text-slate-500 hover:opacity-80',
          className
        )}
        {...props}
      >
        <XCircleIcon className='h-4 w-4 stroke-2' />
        <span className='text-sm font-medium'>Clear</span>
      </Comp>
    );
  }
);

FilterClearButton.displayName = 'FilterClearButton';

export default FilterClearButton;
