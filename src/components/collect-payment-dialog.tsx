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
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { collectPendingPayment } from '@/app/pending-payments/actions';
import type { Receivable } from '@/types';

const collectPaymentSchema = z.object({
  amountCollected: z.coerce.number().positive("Amount must be a positive number."),
});

interface CollectPaymentDialogProps {
  children: React.ReactNode;
  receivable: Receivable;
  onPaymentCollected: () => void;
}

export default function CollectPaymentDialog({ children, receivable, onPaymentCollected }: CollectPaymentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof collectPaymentSchema>>({
    resolver: zodResolver(collectPaymentSchema),
    defaultValues: {
      amountCollected: receivable.pendingAmount,
    },
  });

  const onSubmit = async (values: z.infer<typeof collectPaymentSchema>) => {
    if (values.amountCollected > receivable.pendingAmount) {
        form.setError("amountCollected", { type: "manual", message: "Amount cannot exceed pending amount." });
        return;
    }

    const result = await collectPendingPayment({
        receivableId: receivable.id,
        amountCollected: values.amountCollected
    });

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onPaymentCollected();
      setOpen(false);
      form.reset();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            Record a payment received from {receivable.customerName}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
            <p className="text-sm"><strong>Total Sale:</strong> {receivable.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
            <p className="text-sm font-semibold text-destructive"><strong>Pending Amount:</strong> {receivable.pendingAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
        </div>
        <Form {...form}>
          <form id="collect-payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amountCollected"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Received Now (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="collect-payment-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
