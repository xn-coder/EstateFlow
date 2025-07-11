
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin-sidebar';
import AppHeader from '@/components/app-header';
import AddCatalogContent from '@/components/add-catalog-content';
import DashboardFooter from '@/components/dashboard-footer';
import { ADMIN_ROLES } from '@/lib/roles';

function AddCatalogSkeleton() {
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
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-96 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AddCatalogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const authorizedRoles = ['Admin', 'Manager', 'Business Manager', 'Seller'];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && !authorizedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || !authorizedRoles.includes(user.role)) {
    return <AddCatalogSkeleton />;
  }

  return (
    <SidebarProvider>
      {(ADMIN_ROLES.includes(user.role) || user.role === 'Seller') && <AdminSidebar role={user.role} />}
      <SidebarInset className="flex flex-col">
        <AppHeader role={user.role} currentUser={user} />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <AddCatalogContent currentUser={user} />
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
