
'use client';

import * as React from 'react';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

const StatCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const transactionHistory = [
    { id: '1', date: '2024-05-20', description: 'Payout for Q1 Earnings', amount: 15000, type: 'Debit' },
    { id: '2', date: '2024-04-10', description: 'Commission for "Sunrise Apartments" sale', amount: 2500, type: 'Credit' },
    { id: '3', date: '2024-03-15', description: 'Withdrawal to Bank Account', amount: 8000, type: 'Debit' },
    { id: '4', date: '2024-02-22', description: 'Reward Points Redemption', amount: 500, type: 'Debit' },
];

const earningStatement = [
    { id: '1', date: '2024-05-15', catalog: 'Ocean View Villas', amount: 3200, status: 'Paid' },
    { id: '2', date: '2024-05-10', catalog: 'Downtown Lofts', amount: 1800, status: 'Paid' },
    { id: '3', date: '2024-05-05', catalog: 'Green Meadows', amount: 4500, status: 'Pending' },
    { id: '4', date: '2024-04-28', catalog: 'Sunrise Apartments', amount: 2500, status: 'Paid' },
];

export default function PartnerWalletContent({ currentUser }: { currentUser: User }) {
    const formatCurrency = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Earning" value={formatCurrency(22000)} description="Lifetime earnings" />
                <StatCard title="Paid Amount" value={formatCurrency(18500)} description="Total amount paid out" />
                <StatCard title="Pending Amount" value={formatCurrency(3500)} description="Awaiting payout" />
                <StatCard title="Reward Points" value="500" description="Redeemable points" />
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
                            {transactionHistory.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.date}</TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell className={`text-right font-medium ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.type === 'Credit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
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
                                <TableHead>Catalog Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {earningStatement.map((earning) => (
                                <TableRow key={earning.id}>
                                    <TableCell>{earning.date}</TableCell>
                                    <TableCell>{earning.catalog}</TableCell>
                                    <TableCell>
                                        <Badge variant={earning.status === 'Paid' ? 'secondary' : 'destructive'}>{earning.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(earning.amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
