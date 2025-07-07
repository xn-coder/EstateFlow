
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin-sidebar';
import AppHeader from '@/components/app-header';
import SendMessageContent from '@/components/send-message-content';
import DashboardFooter from '@/components/dashboard-footer';
import { ADMIN_ROLES } from '@/lib/roles';
import PartnerSidebar from '@/components/partner-sidebar';

function UpdatesSkeleton() {
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-12 w-full max-w-sm" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}


export default function UpdatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <UpdatesSkeleton />;
  }

  const isPartner = user.role === 'Partner';
  const isAdminOrSeller = ADMIN_ROLES.includes(user.role) || user.role === 'Seller';

  return (
    <SidebarProvider>
      {isPartner ? <PartnerSidebar /> : (isAdminOrSeller && <AdminSidebar role={user.role} />)}
      <SidebarInset className="flex flex-col">
        <AppHeader role={user.role} currentUser={user} />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <SendMessageContent currentUser={user} />
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
