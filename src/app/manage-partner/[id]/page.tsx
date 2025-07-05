'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLES } from '@/lib/roles';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin-sidebar';
import AppHeader from '@/components/app-header';
import DashboardFooter from '@/components/dashboard-footer';
import { getPartnerById } from '../actions';
import type { PartnerActivationInfo } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import ViewPartnerProfileContent from '@/components/view-partner-profile-content';

function ViewPartnerProfileSkeleton() {
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    </div>
  );
}

export default function ViewPartnerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partnerInfo, setPartnerInfo] = useState<PartnerActivationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const authorizedRoles = ['Admin', 'Manager'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && !authorizedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [user, authLoading, router, authorizedRoles]);
  
  useEffect(() => {
      if (partnerId) {
          getPartnerById(partnerId).then(data => {
              if (data) {
                  setPartnerInfo(data);
              } else {
                  router.push('/manage-partner');
              }
              setLoading(false);
          })
      }
  }, [partnerId, router])

  if (authLoading || loading || !user || !partnerInfo) {
    return <ViewPartnerProfileSkeleton />;
  }
  
  if (!authorizedRoles.includes(user.role)) {
    return <ViewPartnerProfileSkeleton />;
  }

  return (
    <SidebarProvider>
      <AdminSidebar role={user.role} />
      <SidebarInset className="flex flex-col">
        <AppHeader role={user.role} currentUser={user} />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <ViewPartnerProfileContent partnerInfo={partnerInfo} />
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
