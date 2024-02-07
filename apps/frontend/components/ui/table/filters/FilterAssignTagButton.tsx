import { TagIcon } from '@heroicons/react/24/outline';
import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

export type FilterAssignTagButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };
const FilterAssignTagButton = forwardRef<
  HTMLButtonElement,
  FilterAssignTagButtonProps
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      className={cn(
        'flex items-center gap-1 text-sky-500 enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:text-slate-500',
        className
      )}
      {...props}
    >
      <TagIcon className='h-4 w-4 stroke-2' />
      <span className='text-sm font-medium'>Assign tag</span>
    </Comp>
  );
});

FilterAssignTagButton.displayName = 'FilterAssignTagButton';

export default FilterAssignTagButton;
