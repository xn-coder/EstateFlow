
'use client';

import { useState, useEffect } from 'react';
import type { Role } from '@/types';
import { users } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin-sidebar';
import AppHeader from '@/components/app-header';
import SendMessageContent from '@/components/send-message-content';
import DashboardFooter from '@/components/dashboard-footer';

export default function UpdatesPage() {
  const [role, setRole] = useState<Role>('Partner'); // Default to partner as per image
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as Role;
    if (storedRole && ['Admin', 'Seller', 'Partner'].includes(storedRole)) {
      setRole(storedRole);
    }
    setIsClient(true);
  }, []);

  const handleSetRole = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };
  
  const currentUser = users.find(u => u.role === role) || users[0];

    if (!isClient) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {role === 'Admin' && <AdminSidebar />}
      <SidebarInset className="flex flex-col">
        <AppHeader role={role} setRole={handleSetRole} currentUser={currentUser} />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <SendMessageContent />
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
