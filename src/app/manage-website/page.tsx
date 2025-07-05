
'use client';

import { useState, useEffect } from 'react';
import type { Role } from '@/types';
import { users } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin-sidebar';
import AppHeader from '@/components/app-header';
import ManageWebsiteContent from '@/components/manage-website-content';
import DashboardFooter from '@/components/dashboard-footer';

export default function ManageWebsitePage() {
  const [role, setRole] = useState<Role>('Admin');
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
      <div className="flex min-h-screen w-full bg-background">
        <div className="hidden w-64 flex-col gap-4 border-r p-2 md:flex">
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex flex-col gap-2 px-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 md:hidden" />
              <Skeleton className="hidden h-8 w-8 md:flex" />
            </div>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <Skeleton className="h-10 w-44" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[80px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[250px] w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {role === 'Admin' && <AdminSidebar />}
      <SidebarInset className="flex flex-col">
        <AppHeader role={role} setRole={handleSetRole} currentUser={currentUser} />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <ManageWebsiteContent />
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
