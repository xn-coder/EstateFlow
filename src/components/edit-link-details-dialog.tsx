

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
import type { WebsiteData, User } from '@/types';
import { updateLinks } from '@/app/manage-website/actions';
import { useToast } from '@/hooks/use-toast';

const linkDetailsSchema = z.object({
  website: z.string().url('Must be a valid URL. e.g. https://example.com'),
  facebook: z.string().url('Must be a valid URL. e.g. https://facebook.com/user'),
  instagram: z.string().url('Must be a valid URL. e.g. https://instagram.com/user'),
  linkedin: z.string().url('Must be a valid URL. e.g. https://linkedin.com/in/user'),
  youtube: z.string().url('Must be a valid URL. e.g. https://youtube.com/channel/user'),
});

interface EditLinkDetailsDialogProps {
  children: React.ReactNode;
  currentUser: User;
  links: WebsiteData['links'];
  onUpdate: () => void;
}

export default function EditLinkDetailsDialog({ children, currentUser, links, onUpdate }: EditLinkDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof linkDetailsSchema>>({
    resolver: zodResolver(linkDetailsSchema),
  });

  React.useEffect(() => {
    if (open) {
      form.reset(links);
    }
  }, [open, links, form.reset]);

  const onSubmit = async (values: z.infer<typeof linkDetailsSchema>) => {
    const result = await updateLinks(currentUser.id, values);
    if (result.success) {
      toast({ title: 'Success', description: 'Link details updated successfully.' });
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
          <DialogTitle>Edit Link Details</DialogTitle>
          <DialogDescription>Update your website and social media links.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl><Input placeholder="https://facebook.com/yourpage" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl><Input placeholder="https://instagram.com/yourprofile" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl><Input placeholder="https://linkedin.com/in/yourprofile" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtube"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube</FormLabel>
                  <FormControl><Input placeholder="https://youtube.com/yourchannel" {...field} /></FormControl>
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
