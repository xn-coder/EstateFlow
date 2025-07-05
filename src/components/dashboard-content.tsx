"use client"

import { Building2, Handshake, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertyListings from '@/components/property-listings';
import UserManagement from '@/components/user-management';
import LeadManagement from '@/components/lead-management';
import type { Role } from '@/types';
import * as React from 'react';

export default function DashboardContent({ role }: { role: Role }) {
  const tabs = [
    { value: 'properties', label: 'Properties', icon: Building2, component: <PropertyListings role={role} />, roles: ['Admin', 'Seller', 'Partner'] },
    { value: 'users', label: 'Users', icon: Users, component: <UserManagement />, roles: ['Admin'] },
    { value: 'leads', label: 'Leads', icon: Handshake, component: <LeadManagement role={role} />, roles: ['Admin', 'Partner'] },
  ];

  const availableTabs = tabs.filter(tab => tab.roles.includes(role));

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
