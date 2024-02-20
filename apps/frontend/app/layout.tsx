import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

import ReactQueryProvider from '@components/composed/ReactQueryProvider';
import AuthProvider from '@components/composed/auth/AuthProvider';

import '@styles/font.css';
import '@styles/globals.css';

export const metadata: Metadata = {
  title: 'EBSI Vector',
  description: ''
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang='en'>
    <ReactQueryProvider>
      <AuthProvider>
        <body className='app'>
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </ReactQueryProvider>
  </html>
);

export default RootLayout;
