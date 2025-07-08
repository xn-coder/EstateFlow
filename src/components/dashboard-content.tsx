
"use client"

import { Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertyListings from '@/components/property-listings';
import AdminDashboard from '@/components/admin-dashboard';
import type { Role, User } from '@/types';
import * as React from 'react';
import { ADMIN_ROLES } from '@/lib/roles';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardContent({ role }: { role: Role }) {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading skeleton
  }

  if (ADMIN_ROLES.includes(role) || role === 'Seller') {
    return <AdminDashboard />;
  }

  const tabs = [
    { value: 'properties', label: 'Properties', icon: Building2, component: <PropertyListings role={role} />, roles: ['Seller'] },
  ];

  const availableTabs = tabs.filter(tab => tab.roles.includes(role));

  if (availableTabs.length === 0) {
    return <div className="text-center py-16"><p className="text-muted-foreground">No dashboard content available for this role.</p></div>
  }

  return (
    <Tabs defaultValue={availableTabs[0].value} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
        {availableTabs.map(tab => (
          <TabsTrigger value={tab.value} key={tab.value}>
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {availableTabs.map(tab => (
        <TabsContent value={tab.value} key={tab.value} className="mt-6">
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}
