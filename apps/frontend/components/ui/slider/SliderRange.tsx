import { forwardRef } from 'react';

import * as SliderPrimitive from '@ui/slider/Slider.components';

const SliderRange = forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>((props, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    {...props}
    defaultValue={[props.min ?? 0, props.max ?? 0]}
  >
    <SliderPrimitive.Track>
      <SliderPrimitive.Range />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb />
    <SliderPrimitive.Thumb />
  </SliderPrimitive.Root>
));

SliderRange.displayName = 'SliderRange';
export default SliderRange;
