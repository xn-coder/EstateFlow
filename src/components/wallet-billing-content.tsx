'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ManageWalletDialog from './manage-wallet-dialog';
import type { User, WalletSummary } from '@/types';
import { getWalletSummaryData } from '@/app/wallet-billing/actions';
import { Skeleton } from './ui/skeleton';
import { ADMIN_ROLES } from '@/lib/roles';
import SendRewardPointsDialog from './send-reward-points-dialog';

const StatCard = ({ title, value, description, loading }: { title: string; value: string; description: string; loading?: boolean }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
       {loading ? (
            <Skeleton className="h-8 w-3/4 mb-1" />
        ) : (
            <div className="text-3xl font-bold">{value}</div>
        )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const managementItems = [
  { label: 'Manage Wallet', dialogType: 'manageWallet', roles: [...ADMIN_ROLES, 'Seller'] },
  { label: 'Send Reward Points', dialogType: 'sendPoints', roles: ['Seller'] },
  { label: 'Receivable Cash List', href: '/receivable-cash-list', roles: [...ADMIN_ROLES, 'Seller'] },
  { label: 'Payable List', href: '/payable-list', roles: [...ADMIN_ROLES, 'Seller'] },
  { label: 'Payment History', href: '/payment-history', roles: [...ADMIN_ROLES, 'Seller'] },
];

const ManagementListItem = ({ label, href, dialogType, currentUser, onTransactionSuccess }: { label: string; href?: string; dialogType?: string; currentUser: User, onTransactionSuccess: () => void }) => {
  const content = (
    <div className="w-full flex justify-between items-center p-4 text-left transition-colors hover:bg-muted/50 cursor-pointer">
      <span className="font-medium">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );

  if (dialogType) {
    if (dialogType === 'manageWallet') {
        return <ManageWalletDialog currentUser={currentUser} onTransactionSuccess={onTransactionSuccess}>{content}</ManageWalletDialog>;
    }
    if (dialogType === 'sendPoints') {
        return <SendRewardPointsDialog currentUser={currentUser} onSuccess={onTransactionSuccess}>{content}</SendRewardPointsDialog>;
    }
  }

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return <button className="w-full" disabled>{content}</button>;
};


export default function WalletBillingContent({ currentUser }: { currentUser: User }) {
  const [summary, setSummary] = React.useState<WalletSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchSummary = React.useCallback(async () => {
    setLoading(true);
    const data = await getWalletSummaryData();
    setSummary(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);
  
  const formatCurrency = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Balance" value={summary ? formatCurrency(summary.totalBalance) : ''} description="Available in your wallet" loading={loading} />
        <StatCard title="Revenue" value={summary ? formatCurrency(summary.revenue) : ''} description="Total income generated" loading={loading} />
        <StatCard title="Receivable" value={summary ? formatCurrency(summary.receivable) : ''} description="Amount to be received" loading={loading} />
        <StatCard title="Payable" value={summary ? formatCurrency(summary.payable) : ''} description="Amount to be paid" loading={loading} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {managementItems
                .filter(item => item.roles.includes(currentUser.role))
                .map((item) => (
                <ManagementListItem key={item.label} {...item} currentUser={currentUser} onTransactionSuccess={fetchSummary} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
