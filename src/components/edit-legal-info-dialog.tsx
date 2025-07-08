

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { WebsiteData, User } from '@/types';
import { updateLegalInfo } from '@/app/manage-website/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

const legalInfoSchema = z.object({
  about: z.string().min(1, 'About text is required'),
  terms: z.string().url('Must be a valid URL'),
  privacy: z.string().url('Must be a valid URL'),
  refund: z.string().url('Must be a valid URL'),
  disclaimer: z.string().url('Must be a valid URL'),
});

interface EditLegalInfoDialogProps {
  children: React.ReactNode;
  currentUser: User;
  legalInfo: WebsiteData['legalInfo'];
  onUpdate: () => void;
}

export default function EditLegalInfoDialog({ children, currentUser, legalInfo, onUpdate }: EditLegalInfoDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof legalInfoSchema>>({
    resolver: zodResolver(legalInfoSchema),
  });

  React.useEffect(() => {
    if (open) {
      form.reset(legalInfo);
    }
  }, [open, legalInfo, form.reset]);

  const onSubmit = async (values: z.infer<typeof legalInfoSchema>) => {
    const result = await updateLegalInfo(currentUser.id, values);
    if (result.success) {
      toast({ title: 'Success', description: 'Legal info updated successfully.' });
      onUpdate();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Edit About &amp; Legal Links</DialogTitle>
          <DialogDescription>Update your website's about section and legal page links.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <Form {...form}>
            <form id="edit-legal-info-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Page Content</FormLabel>
                    <FormControl><Textarea {...field} className="h-32" /></FormControl>
                    <FormDescription>
                      Currently, this is a plain text field. Rich text editing features are not supported yet.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms of Service Link</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Policy Link</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="refund"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refund Policy Link</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="disclaimer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disclaimer Link</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t bg-background">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="edit-legal-info-form">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
