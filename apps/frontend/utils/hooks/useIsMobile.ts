import { useEffect, useState } from 'react';

import useWindowSize from '@utils/hooks/useWindowSize';

const DEFAULT_BREAKPOINT = 1024;

const useIsMobile = (breakpoint: number = DEFAULT_BREAKPOINT): boolean => {
  const { width } = useWindowSize();
  const [isMobile, setMobile] = useState<boolean>(() => {
    if (width !== null) {
      return width <= (breakpoint || DEFAULT_BREAKPOINT);
    }
    return false;
  });

  useEffect(() => {
    if (width !== null) {
      setMobile(width <= (breakpoint || DEFAULT_BREAKPOINT));
    }
  }, [width, breakpoint]);

  return isMobile;
};

export default useIsMobile;
