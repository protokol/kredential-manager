import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { InputHTMLAttributes } from 'react';
import { forwardRef, memo } from 'react';

import { cn } from '@utils/cn';

import Input from '@ui/Input';

export type FilterSearchProps = InputHTMLAttributes<HTMLInputElement>;

const FilterSearch = forwardRef<HTMLInputElement, FilterSearchProps>(
  ({ className, type, ...props }, ref) => (
    <div className='relative'>
      <MagnifyingGlassIcon className='pointer-events-none absolute bottom-0 left-2 top-0 mb-auto ml-0 mr-auto mt-auto h-5 w-5 flex-shrink-0 stroke-2 text-slate-500 peer-disabled:text-slate-500' />
      <Input
        type='text'
        ref={ref}
        {...props}
        className={cn('pl-8', className)}
      />
    </div>
  )
);
FilterSearch.displayName = 'FilterSearch';

export default memo(FilterSearch);
