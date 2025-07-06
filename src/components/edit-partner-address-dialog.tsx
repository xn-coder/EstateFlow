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
import { updatePartnerAddressDetails } from '@/app/profile/actions';
import type { PartnerActivationInfo } from '@/types';

const partnerAddressDetailsSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'A valid pin code is required'),
  country: z.string().min(1, 'Country is required'),
});

interface EditPartnerAddressDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
  onUpdate: () => void;
}

export default function EditPartnerAddressDialog({ children, partnerInfo, onUpdate }: EditPartnerAddressDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { profile } = partnerInfo;

  const form = useForm<z.infer<typeof partnerAddressDetailsSchema>>({
    resolver: zodResolver(partnerAddressDetailsSchema),
    defaultValues: {
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      country: 'India',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        country: 'India',
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (values: z.infer<typeof partnerAddressDetailsSchema>) => {
    const result = await updatePartnerAddressDetails(profile.id, values);
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
          <DialogTitle>Edit Address Details</DialogTitle>
          <DialogDescription>Update your address information.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="pincode" render={({ field }) => (<FormItem><FormLabel>Pin Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
