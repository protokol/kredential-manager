import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

import '@styles/font.css';
import '@styles/globals.css';

export const metadata: Metadata = {
  title: 'EBSI Vector',
  description: ''
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang='en'>
    <body className='app'>
      {children}
      <Toaster />
    </body>
  </html>
);

export default RootLayout;
