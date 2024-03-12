import type { ElementRef, ReactNode } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import * as AccordionPrimitive from '@ui/accordion/Accordion.components';

type AccordionProps = ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Accordion
> & {
  items: AccordionItem[];
};

type AccordionItem = {
  id: string;
  title: ReactNode;
  content: ReactNode;
};

const Accordion = forwardRef<
  ElementRef<typeof AccordionPrimitive.Accordion>,
  AccordionProps
>(({ items, ...props }, ref) => (
  <AccordionPrimitive.Accordion {...props} ref={ref}>
    {items.map(({ id, title, content }: AccordionItem) => (
      <AccordionPrimitive.AccordionItem key={id} value={id}>
        <AccordionPrimitive.AccordionTrigger>
          {title}
        </AccordionPrimitive.AccordionTrigger>
        <AccordionPrimitive.AccordionContent>
          {content}
        </AccordionPrimitive.AccordionContent>
      </AccordionPrimitive.AccordionItem>
    ))}
  </AccordionPrimitive.Accordion>
));

Accordion.displayName = AccordionPrimitive.Accordion.displayName;

export default Accordion;
