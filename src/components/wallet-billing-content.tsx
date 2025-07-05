
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ManageWalletDialog from './manage-wallet-dialog';

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
  { label: 'Manage Wallet', href: '#', isDialog: true },
  { label: 'Receivable Cash List', href: '/receivable-cash-list', isDialog: false },
  { label: 'Payable List', href: '/payable-list', isDialog: false },
  { label: 'Payment History', href: '/payment-history', isDialog: false },
];

const ManagementListItem = ({ label, href, isDialog }: { label: string; href: string; isDialog: boolean }) => {
  const content = (
    <div className="w-full flex justify-between items-center p-4 text-left transition-colors hover:bg-muted/50 cursor-pointer">
      <span className="font-medium">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );

  if (isDialog) {
    return <ManageWalletDialog>{content}</ManageWalletDialog>;
  }

  if (href !== '#') {
    return <Link href={href} className="block">{content}</Link>;
  }

  return <button className="w-full" disabled>{content}</button>;
};


export default function WalletBillingContent() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Balance" value="100" description="Available in your wallet" />
        <StatCard title="Revenue" value="1000" description="Total income generated" />
        <StatCard title="Receivable" value="100" description="Amount to be received" />
        <StatCard title="Payable" value="100" description="Amount to be paid" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {managementItems.map((item) => (
                <ManagementListItem key={item.label} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
