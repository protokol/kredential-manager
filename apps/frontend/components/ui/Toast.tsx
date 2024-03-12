import {
  ArrowLongRightIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { cn } from '@utils/cn';

export type ToastProps = {
  text?: ReactNode;
  duration?: number;
  detailsLink?: string;
  dismiss?: () => void;
  actionText?: string;
  action?: () => void;
} & VariantProps<typeof toastVariants>;

const variantIcon = {
  success: CheckCircleIcon,
  info: InformationCircleIcon,
  error: XCircleIcon
};

export const toastVariants = cva(
  'group pointer-events-auto relative rounded-2xl flex w-full justify-between items-center gap-2 overflow-hidden p-4 shadow-1 transition-all max-w-screen-sm',
  {
    variants: {
      variant: {
        info: 'bg-sky-950',
        success: 'bg-green-700',
        error: 'bg-red-700'
      }
    },
    defaultVariants: {
      variant: 'info'
    }
  }
);

const Toast: FC<ToastProps> = ({
  variant,
  text,
  detailsLink,
  action,
  dismiss,
  actionText
}) => {
  const Icon = variantIcon[variant || 'info'];

  return (
    <div className={cn(toastVariants({ variant }))}>
      <div className='flex gap-2'>
        <Icon className='h-5 w-5 flex-shrink-0 text-white' />
        <div className='grid gap-1'>
          {text && <div className='text-sm font-medium text-white'>{text}</div>}
        </div>
      </div>
      {detailsLink && (
        <Link
          href={detailsLink}
          className='flex cursor-pointer items-center gap-2 rounded-md p-1 text-sm text-white'
        >
          Details
          <ArrowLongRightIcon className='h-3 w-3' />
        </Link>
      )}
      {action && (
        <div
          className='flex cursor-pointer items-center gap-2 rounded-md p-1 text-sm text-white underline'
          onClick={() => {
            action();
            dismiss!();
          }}
        >
          {actionText}
        </div>
      )}
    </div>
  );
};

export default Toast;
