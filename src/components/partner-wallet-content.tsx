
'use client';

import * as React from 'react';
import type { User, PartnerWalletData, Payable } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getPartnerWalletData } from '@/app/wallet-billing/actions';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

const StatCard = ({ title, value, description, loading, href }: { title: string; value: string; description: string; loading: boolean, href?: string }) => {
  const content = (
    <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
        {loading ? (
                <Skeleton className="h-9 w-3/4 mb-1" />
            ) : (
                <div className="text-3xl font-bold">{value}</div>
            )}
        <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
  );

  if (href) {
      return <Link href={href} className="block rounded-lg">{content}</Link>
  }

  return content;
};

export default function PartnerWalletContent({ currentUser }: { currentUser: User }) {
    const [walletData, setWalletData] = React.useState<PartnerWalletData | null>(null);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        const fetchData = async () => {
            if (currentUser?.id) {
                setLoading(true);
                const data = await getPartnerWalletData(currentUser.id);
                setWalletData(data);
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser.id]);

    const formatCurrency = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

    const transactionHistory = React.useMemo(() => {
        return walletData?.transactions
            .filter(t => t.status === 'Paid')
            .map(t => ({
                id: t.id,
                date: t.date,
                description: t.description || `Payment Received`,
                amount: t.payableAmount,
                type: 'Credit'
            })) || [];
    }, [walletData]);

    const earningStatement = walletData?.transactions || [];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Earning" value={walletData ? formatCurrency(walletData.totalEarning) : '₹0'} description="Lifetime earnings" loading={loading} />
                <StatCard title="Paid Amount" value={walletData ? formatCurrency(walletData.paidAmount) : '₹0'} description="Total amount paid out" loading={loading} />
                <StatCard title="Pending Amount" value={walletData ? formatCurrency(walletData.pendingAmount) : '₹0'} description="Awaiting payout" loading={loading} />
                <StatCard title="Reward Points" value={walletData ? walletData.rewardPoints.toString() : '0'} description="Redeemable points" loading={loading} href="/reward-points-history" />
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>My Wallet Transaction</CardTitle>
                            <CardDescription>View your recent wallet activity.</CardDescription>
                        </div>
                        <Button>Withdrawal Request</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : transactionHistory.length > 0 ? (
                                transactionHistory.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.date}</TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                        + {formatCurrency(transaction.amount)}
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center">No paid transactions found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My Earning Statement</CardTitle>
                    <CardDescription>A detailed breakdown of your earnings.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : earningStatement.length > 0 ? (
                                earningStatement.map((earning) => (
                                <TableRow key={earning.id}>
                                    <TableCell>{earning.date}</TableCell>
                                    <TableCell>{earning.description || 'Commission Earning'}</TableCell>
                                    <TableCell>
                                        <Badge variant={earning.status === 'Paid' ? 'success' : 'destructive'}>{earning.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(earning.payableAmount)}</TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">No earnings found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
