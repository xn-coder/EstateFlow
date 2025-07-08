'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { manageWalletTransaction } from '@/app/wallet-billing/actions';
import type { User } from '@/types';

const walletActions = ["Topup wallet", "Receive from partner", "Receive from customer", "Send to partner", "Send to customer"] as const;
const paymentMethods = ["cash", "cheque", "debit card", "credit card", "gpay", "phonepe", "paytm", "upi", "others"] as const;

const manageWalletSchema = z.object({
  action: z.enum(walletActions),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  paymentMethod: z.enum(paymentMethods),
  password: z.string().min(1, 'Admin password is required to confirm.'),
  recipientId: z.string().optional(),
}).refine((data) => {
    if ((data.action.includes('partner') || data.action.includes('customer')) && (!data.recipientId || data.recipientId.trim() === '')) {
      return false;
    }
    return true;
}, {
    message: 'Recipient ID is required for this action.',
    path: ['recipientId'],
});

interface ManageWalletDialogProps {
  children: React.ReactNode;
  currentUser: User;
  onTransactionSuccess: () => void;
}

export default function ManageWalletDialog({ children, currentUser, onTransactionSuccess }: ManageWalletDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof manageWalletSchema>>({
    resolver: zodResolver(manageWalletSchema),
    defaultValues: {
      action: 'Topup wallet',
      amount: 0,
      paymentMethod: 'cash',
      password: '',
      recipientId: '',
    },
  });

  const actionType = form.watch('action');

  const onSubmit = async (values: z.infer<typeof manageWalletSchema>) => {
    setIsSubmitting(true);
    const result = await manageWalletTransaction({
      ...values,
      userId: currentUser.id,
    });
    
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onTransactionSuccess();
      setOpen(false);
      form.reset();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Wallet</DialogTitle>
          <DialogDescription>Perform wallet transactions. Admin confirmation is required.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="manage-wallet-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Action</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {walletActions.map(action => <SelectItem key={action} value={action}>{action}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(actionType.includes('partner') || actionType.includes('customer')) && (
              <FormField
                control={form.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{actionType.includes('partner') ? 'Partner ID' : 'Customer ID'}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter ${actionType.includes('partner') ? 'Partner' : 'Customer'} ID`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <ScrollArea className="h-48">
                            {paymentMethods.map(method => <SelectItem key={method} value={method} className="capitalize">{method}</SelectItem>)}
                        </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Admin Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="manage-wallet-form" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
