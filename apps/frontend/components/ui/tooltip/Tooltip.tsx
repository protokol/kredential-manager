'use client';

import type { FC, ReactNode } from 'react';

import * as Tooltip from '@components/ui/tooltip/Tooltip.components';

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
};

const TooltipComponent: FC<TooltipProps> = ({
  children,
  content,
  ...triggerProps
}) => (
  <Tooltip.TooltipProvider delayDuration={100}>
    <Tooltip.TooltipRoot>
      <Tooltip.TooltipTrigger {...triggerProps}>
        {children}
      </Tooltip.TooltipTrigger>
      <Tooltip.TooltipContent side='top' align='center'>
        {content}
        <Tooltip.TooltipArrow />
      </Tooltip.TooltipContent>
    </Tooltip.TooltipRoot>
  </Tooltip.TooltipProvider>
);

export default TooltipComponent;
