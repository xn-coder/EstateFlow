
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { updateMessages } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import type { UpdateMessage } from '@/types';


const announcementSchema = z.object({
  type: z.literal('announcement'),
  announcementFor: z.enum(['partner', 'seller', 'both'], { required_error: 'Please select an audience.' }),
  subject: z.string().min(1, 'Subject is required.'),
  details: z.string().min(1, 'Details are required.'),
});

const directMessageSchema = z.object({
  type: z.enum(['partner', 'seller']),
  recipientId: z.string().min(1, 'Recipient ID is required.'),
  subject: z.string().min(1, 'Subject is required.'),
  details: z.string().min(1, 'Details are required.'),
});

const formSchema = z.discriminatedUnion('type', [announcementSchema, directMessageSchema]);


interface MessageListProps {
  onMessageSelect: (message: UpdateMessage) => void;
}

const MessageList = ({ onMessageSelect }: MessageListProps) => (
    <Card>
        <CardHeader>
            <CardTitle>Updates</CardTitle>
            <CardDescription>You have {updateMessages.filter(m => !m.read).length} unread messages.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                    {updateMessages.map((message) => (
                    <button
                        key={message.id}
                        onClick={() => onMessageSelect(message)}
                        className={cn(
                        'w-full text-left flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50',
                        !message.read && 'bg-primary/5'
                        )}
                    >
                        <Avatar className="h-10 w-10 border">
                        <AvatarImage src={'https://placehold.co/40x40.png'} alt={message.from} data-ai-hint="person abstract" />
                        <AvatarFallback>{message.from.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-start">
                              <div className="font-semibold">{message.from}</div>
                              <div className="text-xs text-muted-foreground">{message.date}</div>
                          </div>
                          <p className={cn('font-medium truncate', !message.read && 'text-primary')}>{message.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{message.body}</p>
                        </div>
                    </button>
                    ))}
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
);

interface MessageDetailProps {
  message: UpdateMessage;
  onBack: () => void;
}

const MessageDetail = ({ message, onBack }: MessageDetailProps) => (
  <Card>
    <CardHeader className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="self-start justify-start p-0 h-auto text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to messages
        </Button>
        <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={'https://placehold.co/40x40.png'} alt={message.from} data-ai-hint="person abstract" />
                    <AvatarFallback>{message.from.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{message.from}</p>
                </div>
            </div>
            <div className="text-sm text-muted-foreground">
                {message.date}
            </div>
        </div>
        <CardTitle className="text-2xl !mt-2">{message.subject}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="prose dark:prose-invert max-w-none prose-p:my-2">
        <p>{message.body}</p>
      </div>
    </CardContent>
  </Card>
);


export default function SendMessageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = React.useState<'list' | 'form'>('list');
  const [selectedMessage, setSelectedMessage] = React.useState<UpdateMessage | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'announcement',
      announcementFor: 'partner',
      subject: '',
      details: '',
    },
  });

  const messageType = form.watch('type');

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Sending message:', values);
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
    setSelectedMessage(null);
  };

  const handleContactClick = () => {
    router.push('/contact-book');
  };

  const handleMessageSelect = (message: UpdateMessage) => {
    const targetMessage = updateMessages.find(m => m.id === message.id);
    if(targetMessage) {
        targetMessage.read = true;
    }
    setSelectedMessage(message);
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-4">
        <Button onClick={() => { setView('list'); setSelectedMessage(null); }} className="flex-1" variant={view === 'list' ? 'default' : 'outline'}>
          Announcements
        </Button>
        <Button onClick={() => setView('form')} className="flex-1" variant={view === 'form' ? 'default' : 'outline'}>
          Send Message
        </Button>
        <Button onClick={handleContactClick} className="flex-1" variant="outline">
          Contacts
        </Button>
      </div>

      {view === 'list' && (
        selectedMessage ? (
          <MessageDetail message={selectedMessage} onBack={handleBackToList} />
        ) : (
          <MessageList onMessageSelect={handleMessageSelect} />
        )
      )}

      {view === 'form' && (
        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>Compose and send your message. Or, go back to the <Button variant="link" className="p-0 h-auto" onClick={() => { setView('list'); setSelectedMessage(null); }}>message list</Button>.</CardDescription>
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
                    // @ts-ignore - discriminated union makes this safe
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
                    // @ts-ignore - discriminated union makes this safe
                    control={form.control}
                    name="recipientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{messageType === 'partner' ? 'Partner ID' : 'Seller ID'}</FormLabel>
                        <FormControl>
                          <Input placeholder={`Enter the ${messageType} ID`} {...field} />
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
                  // @ts-ignore - discriminated union makes this safe
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
                    <Button type="submit">Send Message</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
