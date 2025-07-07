
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLES } from '@/lib/roles';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin-sidebar';
import AppHeader from '@/components/app-header';
import DashboardFooter from '@/components/dashboard-footer';
import { getSupportTicketById } from '@/app/support-ticket/actions';
import type { SupportTicket } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import ProcessTicketContent from '@/components/process-ticket-content';

function ProcessTicketSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function ProcessTicketPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const authorizedRoles = ['Admin', 'Support Team'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && !authorizedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [user, authLoading, router, authorizedRoles]);
  
  const fetchTicket = useCallback(async () => {
    if (ticketId) {
      const data = await getSupportTicketById(ticketId);
      if (data) {
        setTicket(data);
      } else {
        router.push('/support-ticket');
      }
      setLoading(false);
    }
  }, [ticketId, router]);
  
  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  if (authLoading || loading || !user || !ticket) {
    return (
      <SidebarProvider>
        {user && ADMIN_ROLES.includes(user.role) && <AdminSidebar role={user.role} />}
        <SidebarInset className="flex flex-col">
          {user && <AppHeader role={user.role} currentUser={user} />}
          <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            <ProcessTicketSkeleton />
          </main>
          <DashboardFooter />
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  if (!authorizedRoles.includes(user.role)) {
    return <ProcessTicketSkeleton />;
  }

  return (
    <SidebarProvider>
      {ADMIN_ROLES.includes(user.role) && <AdminSidebar role={user.role} />}
      <SidebarInset className="flex flex-col">
        <AppHeader role={user.role} currentUser={user} />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <ProcessTicketContent ticket={ticket} onUpdate={fetchTicket} currentUser={user} />
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
