import type { FC, PropsWithChildren } from 'react';

import { cn } from '@utils/cn';

type FullHeightCenterLayoutProps = PropsWithChildren<{
  className?: string;
}>;
const FullHeightCenterLayout: FC<FullHeightCenterLayoutProps> = ({
  className,
  ...props
}) => (
  <div
    {...props}
    className={cn(
      'mx-auto flex min-h-screen w-full flex-col items-center justify-center bg-radial-gradient p-4',
      className
    )}
  />
);

export default FullHeightCenterLayout;
