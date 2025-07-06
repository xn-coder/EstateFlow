
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLES } from '@/lib/roles';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin-sidebar';
import PartnerSidebar from '@/components/partner-sidebar';
import AppHeader from '@/components/app-header';
import DashboardFooter from '@/components/dashboard-footer';
import { getCatalogById } from '@/app/add-catalog/actions';
import type { Catalog } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import ViewCatalogContent from '@/components/view-catalog-content';

function ViewCatalogSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function ViewCatalogPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const catalogId = params.id as string;

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  
  // This page is viewable by admins and partners
  const authorizedRoles = [...ADMIN_ROLES, 'Partner'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && !authorizedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
      if (catalogId) {
          getCatalogById(catalogId).then(data => {
              if (data) {
                  setCatalog(data);
              } else {
                  // Maybe redirect to a 404 page or the main catalog list
                  router.push('/manage-catalog');
              }
              setLoading(false);
          })
      }
  }, [catalogId, router])

  if (authLoading || loading || !user || !catalog) {
    // Show skeleton within the main layout for better UX
    return (
      <SidebarProvider>
        {user && ADMIN_ROLES.includes(user.role) && <AdminSidebar role={user.role} />}
        {user && user.role === 'Partner' && <PartnerSidebar />}
        <SidebarInset className="flex flex-col">
          {user && <AppHeader role={user.role} currentUser={user} />}
          <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            <ViewCatalogSkeleton />
          </main>
          <DashboardFooter />
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  if (!authorizedRoles.includes(user.role)) {
    // This case should be handled by the useEffect, but it's a good fallback
    return <ViewCatalogSkeleton />;
  }

  return (
    <SidebarProvider>
      {ADMIN_ROLES.includes(user.role) && <AdminSidebar role={user.role} />}
      {user.role === 'Partner' && <PartnerSidebar />}
      <SidebarInset className="flex flex-col">
        <AppHeader role={user.role} currentUser={user} />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <ViewCatalogContent catalog={catalog} currentUser={user} />
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
