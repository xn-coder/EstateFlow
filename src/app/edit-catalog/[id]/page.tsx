
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin-sidebar';
import AppHeader from '@/components/app-header';
import AddCatalogContent from '@/components/add-catalog-content';
import DashboardFooter from '@/components/dashboard-footer';
import { ADMIN_ROLES } from '@/lib/roles';
import { getCatalogById } from '@/app/add-catalog/actions';
import type { Catalog } from '@/types';
import { useToast } from '@/hooks/use-toast';


function EditCatalogSkeleton() {
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


export default function EditCatalogPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const catalogId = params.id as string;

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);

  const authorizedRoles = ['Admin', 'Manager', 'Business Manager', 'Seller'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && !authorizedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [user, authLoading, router, authorizedRoles]);

  useEffect(() => {
    if (catalogId && user) {
        setLoading(true);
        getCatalogById(catalogId).then(data => {
            if (data) {
                if (user.role === 'Seller' && data.sellerId !== user.id) {
                    toast({ variant: 'destructive', title: 'Unauthorized', description: 'You do not have permission to edit this catalog.' });
                    router.push('/manage-catalog');
                } else {
                    setCatalog(data);
                }
            } else {
                toast({ variant: 'destructive', title: 'Not Found', description: 'Catalog not found.' });
                router.push('/manage-catalog');
            }
            setLoading(false);
        });
    }
  }, [catalogId, router, user, toast]);


  if (authLoading || loading || !user || !catalog) {
    return <EditCatalogSkeleton />;
  }

  return (
    <SidebarProvider>
      {(ADMIN_ROLES.includes(user.role) || user.role === 'Seller') && <AdminSidebar role={user.role} />}
      <SidebarInset className="flex flex-col">
        <AppHeader role={user.role} currentUser={user} />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <AddCatalogContent currentUser={user} catalogToEdit={catalog} />
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
