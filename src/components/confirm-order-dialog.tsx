
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
import { useToast } from '@/hooks/use-toast';
import { confirmOrder } from '@/app/manage-orders/actions';
import type { SubmittedEnquiry } from '@/types';

const confirmOrderSchema = z.object({
  amountPaid: z.coerce.number().min(0, "Amount must be a positive number."),
});

interface ConfirmOrderDialogProps {
  children: React.ReactNode;
  enquiry: SubmittedEnquiry;
  onOrderConfirmed: () => void;
}

export default function ConfirmOrderDialog({ children, enquiry, onOrderConfirmed }: ConfirmOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof confirmOrderSchema>>({
    resolver: zodResolver(confirmOrderSchema),
    defaultValues: {
      amountPaid: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof confirmOrderSchema>) => {
    const result = await confirmOrder({
        enquiryId: enquiry.id,
        amountPaid: values.amountPaid
    });

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onOrderConfirmed();
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
          <DialogTitle>Confirm Order: {enquiry.enquiryId}</DialogTitle>
          <DialogDescription>
            Confirm the order for "{enquiry.catalogTitle}" and enter the amount paid by the customer.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="confirm-order-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormItem>
              <FormLabel>Total Sale Value</FormLabel>
              <FormControl>
                {/* This is for display only, not part of the form state */}
                <Input value={enquiry.catalogTitle} readOnly disabled />
              </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Paid (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5000" {...field} />
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
          <Button type="submit" form="confirm-order-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Confirming...' : 'Confirm Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
