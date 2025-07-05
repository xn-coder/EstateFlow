
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const sendUpdateSchema = z.object({
  recipients: z.object({
    sellers: z.boolean().default(false),
    partners: z.boolean().default(false),
  }).refine((data) => data.sellers || data.partners, {
    message: 'At least one recipient group must be selected.',
    path: ['sellers'],
  }),
  subject: z.string().min(1, 'Subject is required.'),
  message: z.string().min(1, 'Message is required.'),
});

interface SendUpdateDialogProps {
  children: React.ReactNode;
}

export default function SendUpdateDialog({ children }: SendUpdateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sendUpdateSchema>>({
    resolver: zodResolver(sendUpdateSchema),
    defaultValues: {
      recipients: {
        sellers: false,
        partners: false,
      },
      subject: '',
      message: '',
    },
  });

  const onSubmit = (values: z.infer<typeof sendUpdateSchema>) => {
    console.log('Sending update:', values);
    toast({
        title: 'Message Sent!',
        description: 'Your update has been sent to the selected recipients.',
    });
    setOpen(false);
    form.reset();
  };
  
  // This is a bit of a workaround to display the error message for the checkbox group
  const recipientsError = form.formState.errors.recipients as any;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send New Update</DialogTitle>
          <DialogDescription>Compose and send a new message to sellers or partners.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
                <FormLabel>Recipients</FormLabel>
                <div className="flex items-center space-x-4 pt-2">
                    <FormField
                        control={form.control}
                        name="recipients.sellers"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>All Sellers</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="recipients.partners"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>All Partners</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
                 {recipientsError && <FormMessage>{recipientsError.message}</FormMessage>}
            </FormItem>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter message subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Type your message here." className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Send Message</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
