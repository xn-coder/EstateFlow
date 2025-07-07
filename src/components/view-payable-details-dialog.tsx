'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import type { Payable } from '@/types';

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-3 border-b last:border-b-0">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm sm:col-span-2 sm:text-right">{value || 'N/A'}</dd>
  </div>
);

interface ViewPayableDetailsDialogProps {
  children: React.ReactNode;
  payable: Payable;
}

export default function ViewPayableDetailsDialog({ children, payable }: ViewPayableDetailsDialogProps) {
  const getStatusBadgeVariant = (status: Payable['status']) => {
    return status === 'Paid' ? 'success' : 'destructive';
  }
  const formatCurrency = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payable Details</DialogTitle>
          <DialogDescription>
            Details for transaction to {payable.recipientName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 py-4">
           <DetailRow label="Transaction Date" value={payable.date} />
           <DetailRow label="Recipient Name" value={payable.recipientName} />
           <DetailRow label="Recipient ID" value={payable.recipientId} />
           <DetailRow label="Description" value={payable.description} />
           <DetailRow label="Payable Amount" value={formatCurrency(payable.payableAmount)} />
           <DetailRow label="Status" value={<Badge variant={getStatusBadgeVariant(payable.status)}>{payable.status}</Badge>} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
