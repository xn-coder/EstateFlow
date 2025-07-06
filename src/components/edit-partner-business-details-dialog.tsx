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
import { updatePartnerBusinessDetails } from '@/app/profile/actions';
import type { PartnerActivationInfo } from '@/types';

const partnerBusinessDetailsSchema = z.object({
  businessType: z.string().min(1, 'Business type is required'),
  gstn: z.string().optional(),
  businessAge: z.coerce.number().min(0, 'Business age cannot be negative'),
  areaCovered: z.string().min(1, 'Area covered is required'),
});

interface EditPartnerBusinessDetailsDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
  onUpdate: () => void;
}

export default function EditPartnerBusinessDetailsDialog({ children, partnerInfo, onUpdate }: EditPartnerBusinessDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { profile } = partnerInfo;

  const form = useForm<z.infer<typeof partnerBusinessDetailsSchema>>({
    resolver: zodResolver(partnerBusinessDetailsSchema),
    defaultValues: {
      businessType: profile.businessType,
      gstn: profile.gstn || '',
      businessAge: profile.businessAge,
      areaCovered: profile.areaCovered,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        businessType: profile.businessType,
        gstn: profile.gstn || '',
        businessAge: profile.businessAge,
        areaCovered: profile.areaCovered,
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (values: z.infer<typeof partnerBusinessDetailsSchema>) => {
    const result = await updatePartnerBusinessDetails(profile.id, values);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
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
          <DialogTitle>Edit Business Details</DialogTitle>
          <DialogDescription>Update your business information.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="businessType" render={({ field }) => (<FormItem><FormLabel>Business Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="gstn" render={({ field }) => (<FormItem><FormLabel>GSTN (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="businessAge" render={({ field }) => (<FormItem><FormLabel>Age of Business (in years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="areaCovered" render={({ field }) => (<FormItem><FormLabel>Area Covered</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
