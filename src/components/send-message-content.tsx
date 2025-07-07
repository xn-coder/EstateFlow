'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ArrowLeft, Pencil } from 'lucide-react';
import type { Message, User } from '@/types';
import { getMessages, markMessageAsRead, sendMessage } from '@/app/messages/actions';
import { format, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';

// New component for sellers
const SellerSendMessageForm = ({ currentUser }: { currentUser: User }) => {
    const { toast } = useToast();

    const sellerSchema = z.object({
        recipientType: z.enum(['all', 'specific']),
        recipientId: z.string().optional(),
        subject: z.string().min(1, 'Subject is required.'),
        details: z.string().min(1, 'Details are required.'),
    }).refine(data => {
        return !(data.recipientType === 'specific' && (!data.recipientId || data.recipientId.trim() === ''));
    }, {
        message: 'Partner ID or Email is required.',
        path: ['recipientId'],
    });

    const form = useForm<z.infer<typeof sellerSchema>>({
        resolver: zodResolver(sellerSchema),
        defaultValues: {
            recipientType: 'all',
            subject: '',
            details: '',
        }
    });

    const recipientType = form.watch('recipientType');

    const onSubmit = async (values: z.infer<typeof sellerSchema>) => {
        let actionData;
        if (values.recipientType === 'all') {
            actionData = {
                type: 'announcement' as const,
                announcementFor: 'partner' as const,
                subject: values.subject,
                details: values.details,
            };
        } else {
            actionData = {
                type: 'partner' as const,
                recipientId: values.recipientId,
                subject: values.subject,
                details: values.details,
            };
        }

        const result = await sendMessage(actionData, currentUser);
        if (result.success) {
            toast({
                title: 'Message Sent!',
                description: 'Your message has been successfully sent.',
            });
            form.reset();
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send an Update to Partners</CardTitle>
                <CardDescription>Compose and send your message to all or a specific partner.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="recipientType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recipient</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">All Partners</SelectItem>
                                            <SelectItem value="specific">Specific Partner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {recipientType === 'specific' && (
                             <FormField
                                control={form.control}
                                name="recipientId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Partner ID or Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Partner ID or Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
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
                            name="details"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Details</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Type your message here." className="min-h-[150px]" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};


// Main component starts here.
// Validation schemas for admin form
const announcementSchema = z.object({
  type: z.literal('announcement'),
  announcementFor: z.enum(['partner', 'seller', 'both'], { required_error: 'Please select an audience.' }),
  subject: z.string().min(1, 'Subject is required.'),
  details: z.string().min(1, 'Details are required.'),
});

const directMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID or Email is required.'),
  subject: z.string().min(1, 'Subject is required.'),
  details: z.string().min(1, 'Details are required.'),
});

const formSchema = z.discriminatedUnion('type', [
    announcementSchema,
    z.object({ type: z.literal('partner') }).merge(directMessageSchema),
    z.object({ type: z.literal('seller') }).merge(directMessageSchema),
]);


interface MessageListProps {
  onMessageSelect: (message: Message) => void;
  onCompose?: () => void;
  isPartner: boolean;
  messages: Message[];
  loading: boolean;
}

const MessageList = ({ onMessageSelect, onCompose, isPartner, messages, loading }: MessageListProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Updates</CardTitle>
                <CardDescription>You have {messages.filter(m => !m.read).length} unread messages.</CardDescription>
            </div>
            {!isPartner && onCompose && (
              <Button onClick={onCompose}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Compose
              </Button>
            )}
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[500px]">
                 {loading ? (
                    <div className="space-y-2 pr-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start gap-4 p-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : messages.length > 0 ? (
                    <div className="space-y-2 pr-4">
                        {messages.map((message) => (
                        <button
                            key={message.id}
                            onClick={() => onMessageSelect(message)}
                            className={cn(
                            'w-full text-left flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50',
                            !message.read && 'bg-primary/5'
                            )}
                        >
                            <Avatar className="h-10 w-10 border">
                            <AvatarImage src={'https://placehold.co/40x40.png'} alt={message.senderName} data-ai-hint="person abstract" />
                            <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div className="font-semibold">{message.senderName}</div>
                                <div className="text-xs text-muted-foreground">{format(parseISO(message.createdAt), 'dd MMM')}</div>
                            </div>
                            <p className={cn('font-medium truncate', !message.read && 'text-primary')}>{message.subject}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{message.details}</p>
                            </div>
                        </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-medium">No Messages</h3>
                        <p className="text-muted-foreground">Your inbox is empty.</p>
                    </div>
                )}
            </ScrollArea>
        </CardContent>
    </Card>
);

interface MessageDetailProps {
  message: Message;
  onBack: () => void;
}

const MessageDetail = ({ message, onBack }: MessageDetailProps) => (
  <Card>
    <CardHeader className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="self-start justify-start p-0 h-auto text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inbox
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row items-start sm:items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={'https://placehold.co/40x40.png'} alt={message.senderName} data-ai-hint="person abstract" />
                    <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{message.senderName}</p>
                </div>
            </div>
            <div className="text-sm text-muted-foreground self-start sm:self-center">
                {format(parseISO(message.createdAt), 'dd MMM yyyy, p')}
            </div>
        </div>
        <CardTitle className="text-2xl !mt-2">{message.subject}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="prose dark:prose-invert max-w-none prose-p:my-2">
        <p>{message.details}</p>
      </div>
    </CardContent>
  </Card>
);


export default function SendMessageContent({ currentUser }: { currentUser: User }) {
  const { toast } = useToast();
  const [view, setView] = React.useState<'list' | 'detail' | 'form'>('list');
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const searchParams = useSearchParams();

  const fetchMessages = React.useCallback(async () => {
    if (currentUser) {
      setLoading(true);
      const data = await getMessages(currentUser.id);
      setMessages(data);
      setLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'announcement',
      announcementFor: 'partner',
      subject: '',
      details: '',
    },
  });

  React.useEffect(() => {
    const recipientId = searchParams.get('recipientId');
    if (recipientId) {
        form.reset({
            type: 'partner',
            recipientId: recipientId,
            subject: '',
            details: '',
        });
        setView('form');
    }
  }, [searchParams, form]);

  const messageType = form.watch('type');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await sendMessage(values, currentUser);
    if (result.success) {
        toast({
            title: 'Message Sent!',
            description: 'Your message has been successfully sent.',
        });
        form.reset({
          type: 'announcement',
          announcementFor: 'partner',
          subject: '',
          details: '',
        });
        setView('list');
    } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };
  
  const handleMessageSelect = (message: Message) => {
    if (!message.read) {
        markMessageAsRead(message.id);
        const updatedMessages = messages.map(m => m.id === message.id ? { ...m, read: true } : m);
        setMessages(updatedMessages);
    }
    setSelectedMessage(message);
    setView('detail');
  };

  const isPartner = currentUser.role === 'Partner';
  const isSeller = currentUser.role === 'Seller';
  
  // Seller View
  if (isSeller) {
      return <SellerSendMessageForm currentUser={currentUser} />;
  }

  // Partner view is just an inbox
  if (isPartner) {
    if (view === 'detail' && selectedMessage) {
        return <MessageDetail message={selectedMessage} onBack={() => setView('list')} />
    }
    return <MessageList onMessageSelect={handleMessageSelect} isPartner={isPartner} messages={messages} loading={loading} />
  }

  // Admin view logic
  if (view === 'form') {
    return (
        <Card>
          <CardHeader>
            <Button variant="ghost" onClick={() => setView('list')} className="self-start justify-start p-0 h-auto text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Inbox
            </Button>
            <CardTitle className="pt-2">Send a Message</CardTitle>
            <CardDescription>Compose and send your message.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Type</FormLabel>
                       <Select
                        onValueChange={(value) => {
                          const newType = value as 'announcement' | 'partner' | 'seller';
                          field.onChange(newType);
                           switch (newType) {
                              case 'announcement':
                                  form.reset({ type: 'announcement', subject: '', details: '', announcementFor: 'partner' });
                                  break;
                              case 'partner':
                                  form.reset({ type: 'partner', subject: '', details: '', recipientId: '' });
                                  break;
                              case 'seller':
                                  form.reset({ type: 'seller', subject: '', details: '', recipientId: '' });
                                  break;
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a message type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="partner">Message to Partner</SelectItem>
                          <SelectItem value="seller">Message to Seller</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {messageType === 'announcement' && (
                  <FormField
                    control={form.control}
                    name="announcementFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Announcement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select announcement type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="partner">For Partner</SelectItem>
                                <SelectItem value="seller">For Seller</SelectItem>
                                <SelectItem value="both">For Both</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(messageType === 'partner' || messageType === 'seller') && (
                  <FormField
                    control={form.control}
                    name="recipientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{messageType === 'partner' ? 'Partner ID or Email' : 'Seller ID or Email'}</FormLabel>
                        <FormControl>
                          <Input placeholder={`Enter the ${messageType} ID or Email`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
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
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type your message here." className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
    );
  }

  if (view === 'detail' && selectedMessage) {
    return <MessageDetail message={selectedMessage} onBack={() => setView('list')} />
  }

  return <MessageList onMessageSelect={handleMessageSelect} onCompose={() => setView('form')} isPartner={isPartner} messages={messages} loading={loading} />
}
