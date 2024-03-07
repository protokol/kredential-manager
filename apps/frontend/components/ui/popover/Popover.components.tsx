import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { PopoverProps } from '@radix-ui/react-popover';
import clsx from 'clsx';
import type { ComponentPropsWithoutRef, ElementRef, FC } from 'react';
import { forwardRef, useEffect } from 'react';

/**
 * Popover is a primitive component used to build components like tooltips, dropdowns, and popovers.
 * @example
 * <Popover>
 *   <PopoverTrigger>Open</PopoverTrigger>
 *   <PopoverContent>Place content for the popover here.</PopoverContent>
 * </Popover>
 */
const Popover: FC<PopoverProps> = ({ onOpenChange, ...props }) => (
  <PopoverPrimitive.Root
    {...props}
    onOpenChange={(open) => {
      onOpenChange?.(open);
    }}
  />
);

Popover.displayName = PopoverPrimitive.Root.displayName;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverClose = PopoverPrimitive.Close;

const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => {
  useEffect(
    () => () => {
      preventPageScrollOnOpen(false);
    },
    []
  );

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={clsx(
          'animate-fade-in z-50 rounded-md outline-none',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover as PopoverRoot, PopoverTrigger, PopoverClose, PopoverContent };

const preventPageScrollOnOpen = (open: boolean) => {
  if (open) {
    const scrollBarWidth =
      window?.innerWidth - document?.documentElement.clientWidth;

    document.body.style.paddingRight = `${scrollBarWidth}px`;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'relative';

    return;
  }

  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.style.position = '';
};
