
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
import { makeAdHocPayment } from '@/app/wallet-billing/actions';
import type { User } from '@/types';

const paymentMethods = ["Wallet", "cash", "cheque", "debit card", "credit card", "gpay", "phonepe", "paytm", "upi", "others"] as const;

const adHocPaymentSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required.'),
  recipientId: z.string().min(1, 'Recipient ID is required.'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  paymentMethod: z.enum(paymentMethods),
  password: z.string().min(1, 'Admin password is required.'),
});

interface AddPayableDialogProps {
  children: React.ReactNode;
  currentUser: User;
  onPaymentSuccess: () => void;
}

export default function AddPayableDialog({ children, currentUser, onPaymentSuccess }: AddPayableDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof adHocPaymentSchema>>({
    resolver: zodResolver(adHocPaymentSchema),
    defaultValues: {
      recipientName: '',
      recipientId: '',
      amount: 0,
      paymentMethod: 'Wallet',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof adHocPaymentSchema>) => {
    setIsSubmitting(true);
    const result = await makeAdHocPayment({
      ...values,
      userId: currentUser.id,
    });
    
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onPaymentSuccess();
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
          <DialogTitle>Make a New Payment</DialogTitle>
          <DialogDescription>Record a new payment. This will create a paid entry in the payable list.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="add-payable-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Office Supplies Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., VENDOR-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          <Button type="submit" form="add-payable-form" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Submit Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
