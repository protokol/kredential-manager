import { forwardRef } from 'react';

import * as SliderPrimitive from '@ui/slider/Slider.components';

const Slider = forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>((props, ref) => (
  <SliderPrimitive.Root ref={ref} {...props}>
    <SliderPrimitive.Track>
      <SliderPrimitive.Range />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb />
  </SliderPrimitive.Root>
));

Slider.displayName = 'Slider';
export default Slider;
