import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

import '@styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EBSI Vector',
  description: ''
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang='en'>
    <body className={inter.className}>
      {children}
      <Toaster />
    </body>
  </html>
);

export default RootLayout;
