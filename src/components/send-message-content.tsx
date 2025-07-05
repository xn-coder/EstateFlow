
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateMessages } from '@/lib/data';
import { cn } from '@/lib/utils';
import SendUpdateDialog from './send-update-dialog';
import { PlusCircle } from 'lucide-react';


const AnnouncementsTab = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>You have {updateMessages.filter(m => !m.read).length} unread messages.</CardDescription>
            </div>
            <SendUpdateDialog>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Send Message
                </Button>
            </SendUpdateDialog>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                    {updateMessages.map((message) => (
                    <button
                        key={message.id}
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
)

const ContactsRedirectPlaceholder = () => (
    <Card>
        <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Your contact list.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground py-20">Redirecting to Contact Book...</p>
        </CardContent>
    </Card>
)

export default function SendMessageContent() {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    if (value === 'contacts') {
      router.push('/contact-book');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="announcements" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="announcements">
                <AnnouncementsTab />
            </TabsContent>

            <TabsContent value="contacts">
                <ContactsRedirectPlaceholder />
            </TabsContent>
        </Tabs>
    </div>
  );
}
