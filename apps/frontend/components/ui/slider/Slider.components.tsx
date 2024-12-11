'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@utils/cn';

const Root = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  />
));

Root.displayName = SliderPrimitive.Root.displayName;

const Track = forwardRef<
  ElementRef<typeof SliderPrimitive.Track>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Track>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Track
    ref={ref}
    className={cn(
      'relative h-2 w-full grow overflow-hidden rounded-full bg-slate-50',
      className
    )}
    {...props}
  />
));

Track.displayName = SliderPrimitive.Track.displayName;

const Range = forwardRef<
  ElementRef<typeof SliderPrimitive.Range>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Range>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Range
    ref={ref}
    className={cn('absolute h-full bg-sky-950', className)}
    {...props}
  />
));

Range.displayName = SliderPrimitive.Range.displayName;

const Thumb = forwardRef<
  ElementRef<typeof SliderPrimitive.Thumb>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Thumb
    ref={ref}
    className={cn(
      'focus-visible:ring-ring ring-badge-yellow block h-4 w-4 rounded-full border border-slate-300 bg-slate-50 shadow transition-colors hover:cursor-grab hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));

Thumb.displayName = SliderPrimitive.Thumb.displayName;

export { Root, Track, Range, Thumb };
