'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpDown } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { getPendingReceivablesForPartner } from '@/app/pending-payments/actions';
import type { Receivable, User } from '@/types';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import CollectPaymentDialog from './collect-payment-dialog';

export default function PendingPaymentsContent({ currentUser }: { currentUser: User }) {
  const router = useRouter();
  const [receivables, setReceivables] = React.useState<Receivable[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchReceivables = React.useCallback(async () => {
    if (currentUser?.partnerCode || currentUser?.id) {
        setLoading(true);
        // Use partner code if available, otherwise fall back to user ID
        const partnerIdentifier = currentUser.partnerCode || currentUser.id;
        const data = await getPendingReceivablesForPartner(partnerIdentifier);
        setReceivables(data);
        setLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div>
              <CardTitle>Customer Pending Payments</CardTitle>
              <CardDescription>A list of customers with outstanding balances.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Pending Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-28" /></TableCell>
                    </TableRow>
                  ))
                ) : receivables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No pending payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  receivables.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(parseISO(item.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                      <TableCell className="text-right font-semibold text-destructive">{item.pendingAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                      <TableCell className="text-right">
                        <CollectPaymentDialog receivable={item} onPaymentCollected={fetchReceivables}>
                            <Button size="sm">Collect Payment</Button>
                        </CollectPaymentDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
