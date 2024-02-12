import type { ReactNode } from 'react';

type ContentLayoutType = {
  title?: string;
  children?: ReactNode;
};
const ContentLayout = ({ title, children }: ContentLayoutType) => (
  <div className='w-screen'>
    <div className='flex h-24 items-center bg-linear-gradient-2 text-3xl font-semibold text-slate-800'>
      {title}
    </div>
    <div className='h-full bg-sky-50'>
      <div className='h-full rounded-xl bg-white p-6'>{children}</div>
    </div>
  </div>
);

export default ContentLayout;
