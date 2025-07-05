'use client';

import { useState, useEffect } from 'react';
import type { Role } from '@/types';
import { users } from '@/lib/data';
import DashboardHeader from '@/components/dashboard-header';
import DashboardContent from '@/components/dashboard-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
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
      <div className="min-h-screen bg-background">
         <header className="sticky top-0 z-40 w-full border-b bg-card shadow-sm">
          <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
             <div className="flex items-center gap-2">
               <Skeleton className="h-8 w-8 rounded-full" />
               <Skeleton className="h-6 w-32" />
             </div>
             <div className="flex flex-1 items-center justify-end space-x-4">
               <Skeleton className="h-10 w-44" />
               <Skeleton className="h-10 w-10 rounded-full" />
             </div>
           </div>
         </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-md mx-auto mb-6">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role={role} setRole={handleSetRole} currentUser={currentUser} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <DashboardContent role={role} />
      </main>
    </div>
  );
}
