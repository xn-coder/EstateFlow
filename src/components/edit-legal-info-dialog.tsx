
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
import { websiteData } from '@/lib/website-data';

const legalInfoSchema = z.object({
  about: z.string().min(1, 'About text is required'),
  terms: z.string().url('Must be a valid URL'),
  privacy: z.string().url('Must be a valid URL'),
  refund: z.string().url('Must be a valid URL'),
  disclaimer: z.string().url('Must be a valid URL'),
});

interface EditLegalInfoDialogProps {
  children: React.ReactNode;
}

export default function EditLegalInfoDialog({ children }: EditLegalInfoDialogProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof legalInfoSchema>>({
    resolver: zodResolver(legalInfoSchema),
    defaultValues: {
      about: websiteData.legalInfo.about,
      terms: websiteData.legalInfo.terms,
      privacy: websiteData.legalInfo.privacy,
      refund: websiteData.legalInfo.refund,
      disclaimer: websiteData.legalInfo.disclaimer,
    },
  });

  const onSubmit = (values: z.infer<typeof legalInfoSchema>) => {
    console.log('Legal info updated:', values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit About &amp; Legal Links</DialogTitle>
          <DialogDescription>Update your website's about section and legal page links.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
