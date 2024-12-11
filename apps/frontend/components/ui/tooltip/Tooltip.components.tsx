import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;

const TooltipArrow = forwardRef<
  ElementRef<typeof TooltipPrimitive.Arrow>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>((props, ref) => (
  <TooltipPrimitive.Arrow ref={ref} className={cn('fill-sky-950')} {...props} />
));

TooltipArrow.displayName = 'TooltipArrow';

const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 2, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-tooltip group max-w-72 overflow-hidden rounded-xl bg-sky-950 px-3 py-2.5 text-xs text-white',
      'fade-in',
      className
    )}
    {...props}
  />
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export {
  Tooltip as TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipProvider,
  TooltipArrow
};
