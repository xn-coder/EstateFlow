"use client"

import * as React from 'react';
import { leads, users } from '@/lib/data';
import type { Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function LeadManagement({ role }: { role: Role }) {
  const partners = users.filter(user => user.role === 'Partner');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead Management</CardTitle>
          <CardDescription>View and assign property leads to partners.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map(lead => (
          <Card key={lead.id} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{lead.propertyName}</CardTitle>
              <CardDescription>Lead for {lead.clientName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm"><strong>Client:</strong> {lead.clientName} ({lead.clientEmail})</p>
              <div className="flex justify-between items-center">
                <Badge variant={lead.status === 'New' ? 'destructive' : 'secondary'}>{lead.status}</Badge>
                {role === 'Admin' && (
                  <div className="w-[150px]">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign Partner" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map(partner => (
                          <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
