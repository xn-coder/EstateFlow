
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
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { sendMessage } from '@/app/messages/actions';

const messageSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  details: z.string().min(1, 'Details are required.'),
  attachment: z.string().optional(),
});

interface SendDirectMessageDialogProps {
  children: React.ReactNode;
  partner: User;
}

export default function SendDirectMessageDialog({ children, partner }: SendDirectMessageDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: '',
      details: '',
      attachment: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('attachment', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof messageSchema>) => {
    if (!currentUser) {
        toast({ title: 'Error', description: 'You must be logged in to send a message.', variant: 'destructive' });
        return;
    }

    const result = await sendMessage({
        type: 'partner',
        recipientId: partner.email,
        ...values,
    }, currentUser);

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      setOpen(false);
      form.reset();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Message to {partner.name}</DialogTitle>
          <DialogDescription>Compose your message below. The partner ID is automatically included.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
                <FormLabel>Partner ID</FormLabel>
                <FormControl>
                    <Input value={partner.partnerCode || partner.email} readOnly disabled />
                </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl><Input placeholder="Enter message subject" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details</FormLabel>
                  <FormControl><Textarea placeholder="Type your message here." className="min-h-[120px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
                <FormLabel>Choose File (Optional)</FormLabel>
                <div className="relative">
                    <Button type="button" variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Attachment
                    </Button>
                    <Input
                        type="file"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={handleFileChange}
                    />
                </div>
                {form.watch('attachment') && <p className="text-sm text-muted-foreground mt-2">File selected.</p>}
            </FormItem>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
