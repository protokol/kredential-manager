import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@utils/cn';

const statusVariants = cva(
  'flex items-center justify-center px-2.5 py-1 rounded-lg h-22 w-fit text-white text-sm min-w-24',
  {
    variants: {
      variant: {
        approved: 'bg-green-700',
        pending: 'bg-gold-default',
        rejected: 'bg-red-700'
      },
      defaultVariants: {
        variant: 'approved'
      }
    }
  }
);

export type Variant = 'pending' | 'rejected' | 'approved';

type VariantTexts = {
  [key in Variant]: string;
};

const variantTexts: VariantTexts = {
  pending: 'Pending',
  rejected: 'Rejected',
  approved: 'Approved'
};

const Status = ({ variant }: VariantProps<typeof statusVariants>) => {
  const statusText = variantTexts[variant!];

  return <div className={cn(statusVariants({ variant }))}>{statusText}</div>;
};

Status.displayName = 'Status';

export default Status;
