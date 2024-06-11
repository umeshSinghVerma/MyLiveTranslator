import { Metadata } from 'next';
import { ReactNode } from 'react';

import ChatNavbar from './ChatNavbar';

export const metadata: Metadata = {
  title: 'My Liv Translator',
  description: 'A workspace for your team, powered by Stream Chat and Clerk.',
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className="flex flex-col h-screen">
      <ChatNavbar />
      <div className="flex flex-grow w-full">
        {children}
      </div>
    </div>
  );
};

export default RootLayout;
