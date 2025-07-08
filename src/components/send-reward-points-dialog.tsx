
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import { sendRewardPoints } from '@/app/wallet-billing/actions';

const sendRewardPointsSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID/Code/Email is required.'),
  points: z.coerce.number().min(1, 'Points must be a positive number.'),
  description: z.string().optional(),
  password: z.string().min(1, 'Your password is required to confirm.'),
});

interface SendRewardPointsDialogProps {
  children: React.ReactNode;
  currentUser: User;
  onSuccess: () => void;
  partner?: User;
}

export default function SendRewardPointsDialog({ children, currentUser, onSuccess, partner }: SendRewardPointsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sendRewardPointsSchema>>({
    resolver: zodResolver(sendRewardPointsSchema),
    defaultValues: {
      recipientId: partner?.partnerCode || partner?.email || '',
      points: 0,
      description: '',
      password: '',
    },
  });

  React.useEffect(() => {
    if (open && partner) {
      form.reset({
        recipientId: partner.partnerCode || partner.email || '',
        points: 0,
        description: '',
        password: '',
      });
    } else if (open && !partner) {
      form.reset({
        recipientId: '',
        points: 0,
        description: '',
        password: '',
      });
    }
  }, [open, partner, form]);

  const onSubmit = async (values: z.infer<typeof sendRewardPointsSchema>) => {
    const result = await sendRewardPoints({
      ...values,
      sellerId: currentUser.id,
    });
    
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onSuccess();
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
          <DialogTitle>Send Reward Points</DialogTitle>
          <DialogDescription>Send reward points to a partner. This cannot be undone.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="send-points-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner ID / Code / Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AF123456789" {...field} disabled={!!partner} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points to Send</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., For sale of catalog CTL123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Your Password</FormLabel>
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
          <Button type="submit" form="send-points-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Sending...' : 'Send Points'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
