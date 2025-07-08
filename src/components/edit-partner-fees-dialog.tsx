

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
import type { WebsiteData } from '@/types';
import { updatePartnerFees } from '@/app/manage-website/actions';
import { useToast } from '@/hooks/use-toast';
import { feeApplicablePartnerCategories } from '@/types';

const partnerFeesSchema = z.object({
  'Super Affiliate Partner': z.coerce.number().min(0),
  'Associate Partner': z.coerce.number().min(0),
  'Channel Partner': z.coerce.number().min(0),
});

interface EditPartnerFeesDialogProps {
  children: React.ReactNode;
  partnerFees: WebsiteData['partnerFees'];
  onUpdate: () => void;
}

export default function EditPartnerFeesDialog({ children, partnerFees, onUpdate }: EditPartnerFeesDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof partnerFeesSchema>>({
    resolver: zodResolver(partnerFeesSchema),
  });

  React.useEffect(() => {
    if (open) {
      const values = {
        'Super Affiliate Partner': partnerFees?.['Super Affiliate Partner'] || 0,
        'Associate Partner': partnerFees?.['Associate Partner'] || 0,
        'Channel Partner': partnerFees?.['Channel Partner'] || 0,
      };
      form.reset(values);
    }
  }, [open, partnerFees, form.reset]);

  const onSubmit = async (values: z.infer<typeof partnerFeesSchema>) => {
    const result = await updatePartnerFees(values);
    if (result.success) {
      toast({ title: 'Success', description: 'Partner fees updated successfully.' });
      onUpdate();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Partner Registration Fees</DialogTitle>
          <DialogDescription>Update the fees for different partner tiers.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {feeApplicablePartnerCategories.map(category => (
                <FormField
                    key={category}
                    control={form.control}
                    name={category}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{category} Fee (INR)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ))}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
