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
import { updatePartnerDigitalCard } from '@/app/profile/actions';
import type { PartnerActivationInfo } from '@/types';

const partnerDigitalCardSchema = z.object({
  position: z.string().optional(),
});

interface EditPartnerDigitalCardDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
  onUpdate: () => void;
}

export default function EditPartnerDigitalCardDialog({ children, partnerInfo, onUpdate }: EditPartnerDigitalCardDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { profile } = partnerInfo;

  const form = useForm<z.infer<typeof partnerDigitalCardSchema>>({
    resolver: zodResolver(partnerDigitalCardSchema),
    defaultValues: {
      position: profile.position || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        position: profile.position || '',
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (values: z.infer<typeof partnerDigitalCardSchema>) => {
    const result = await updatePartnerDigitalCard(profile.id, values);
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
          <DialogTitle>Edit Digital Card</DialogTitle>
          <DialogDescription>Update your position for your digital card.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="position" render={({ field }) => (<FormItem><FormLabel>Position / Title</FormLabel><FormControl><Input placeholder="e.g., Director" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
