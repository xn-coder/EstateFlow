
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

const StatCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value} INR</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const managementItems = [
  'Manage Wallet',
  'Withdrawal Request',
  'Receivable Cash List',
  'Send Rewards Point',
  'Billing and Invoice',
  'Payment History',
];

const ManagementListItem = ({ label }: { label: string }) => (
    <button className="w-full flex justify-between items-center p-4 text-left transition-colors hover:bg-muted/50">
        <span className="font-medium">{label}</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
);


export default function WalletBillingContent() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Wallet" value="100" description="Total Balance" />
        <StatCard title="Revenue" value="1000" description="Weekly Earning" />
        <StatCard title="Receivable" value="100" description="Pending Cash" />
        <StatCard title="Payable" value="100" description="Sending Cash" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {managementItems.map((item) => (
                <ManagementListItem key={item} label={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
