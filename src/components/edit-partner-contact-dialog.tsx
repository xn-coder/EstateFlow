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
import { updatePartnerContactDetails } from '@/app/profile/actions';
import type { PartnerActivationInfo } from '@/types';

const partnerContactDetailsSchema = z.object({
  phone: z.string().min(10, 'A valid phone number is required'),
  whatsapp: z.string().min(10, 'A valid WhatsApp number is required'),
});

interface EditPartnerContactDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
  onUpdate: () => void;
}

export default function EditPartnerContactDialog({ children, partnerInfo, onUpdate }: EditPartnerContactDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user, profile } = partnerInfo;

  const form = useForm<z.infer<typeof partnerContactDetailsSchema>>({
    resolver: zodResolver(partnerContactDetailsSchema),
    defaultValues: {
      phone: profile.phone,
      whatsapp: profile.whatsapp,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        phone: profile.phone,
        whatsapp: profile.whatsapp,
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (values: z.infer<typeof partnerContactDetailsSchema>) => {
    const result = await updatePartnerContactDetails(profile.id, user.id, values);
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
          <DialogTitle>Edit Contact Details</DialogTitle>
          <DialogDescription>Update your contact information.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl><Input value={profile.email} readOnly disabled /></FormControl>
            </FormItem>
            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="whatsapp" render={({ field }) => (<FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
