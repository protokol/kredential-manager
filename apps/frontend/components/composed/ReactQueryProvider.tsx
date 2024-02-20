'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';

import { queryClientConfig } from '@utils/configs/reactQuery';

const ReactQueryProvider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(queryClientConfig);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
