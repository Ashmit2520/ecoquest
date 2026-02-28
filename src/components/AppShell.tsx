'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import TabNavigation from './TabNavigation';

const PUBLIC_ROUTES = ['/login'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-eco-green animate-pulse">Loading...</div>
      </div>
    );
  }

  // Public routes (login) don't need navbar/tabs
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes need auth
  if (!user) {
    return null; // Will redirect via AuthContext
  }

  return (
    <>
      <Navbar />
      <TabNavigation />
      <main className="pb-20 pt-2">
        {children}
      </main>
    </>
  );
}
