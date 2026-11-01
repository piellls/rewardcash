'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

// The public landing page has its own full-width navigation. App routes retain their sidebar.
export default function AppShell({ children }) {
  const isHome = usePathname() === '/';
  if (isHome) return children;
  return (
    <div className="app-shell min-h-screen flex flex-col pt-[5rem] pb-16 md:pb-0">
      <Navbar />
      <div className="flex-1 flex flex-col w-full md:pl-64">
        <main className="flex-1 flex flex-col w-full">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
