
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Bold, Italic, Underline, Link as LinkIcon, FileImage, Code2, HelpCircle, List, ListOrdered, ListChecks, Paintbrush, Pilcrow, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateMessages } from '@/lib/data';
import { cn } from '@/lib/utils';


const RichTextEditorToolbar = () => (
  <div className="flex flex-wrap items-center gap-x-1 rounded-t-md border border-b-0 border-input bg-transparent p-1">
    <Button variant="ghost" size="icon" className="h-8 w-8"><Pilcrow className="w-4 h-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="w-4 h-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="w-4 h-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8"><Underline className="w-4 h-4" /></Button>
    <div className="h-6 w-px bg-border mx-1"></div>
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 text-sm">Roboto <ChevronDown className="w-4 h-4 ml-1" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem>Arial</DropdownMenuItem>
            <DropdownMenuItem>Courier New</DropdownMenuItem>
            <DropdownMenuItem>Georgia</DropdownMenuItem>
            <DropdownMenuItem>Times New Roman</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
    <div className="h-6 w-px bg-border mx-1"></div>
    <Button variant="ghost" size="icon" className="h-8 w-8"><Paintbrush className="w-4 h-4" /></Button>
    <div className="h-6 w-px bg-border mx-1"></div>
    <Button variant="ghost" size="icon" className="h-8 w-8"><List className="w-4 h-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8"><ListOrdered className="w-4 h-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8"><ListChecks className="w-4 h-4" /></Button>
    <div className="h-6 w-px bg-border mx-1"></div>
    <Button variant="ghost" size="icon" className="h-8 w-8"><LinkIcon className="w-4 h-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8"><FileImage className="w-4 h-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8"><Code2 className="w-4 h-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8"><HelpCircle className="w-4 h-4" /></Button>
  </div>
);

const SendMessageForm = () => {
    const [fileName, setFileName] = React.useState('No file chosen');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFileName(e.target.files[0].name);
      } else {
        setFileName('No file chosen');
      }
    };

    return (
        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Send Message!</CardTitle>
                <Upload className="h-5 w-5 text-muted-foreground"/>
            </div>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="user-code">User Code</Label>
                <Input id="user-code" placeholder="User Code" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="subject">Topic Or Subject</Label>
                <Input id="subject" placeholder="Enter Topic Or Subject" />
            </div>
            <div>
                <RichTextEditorToolbar />
                <Textarea 
                placeholder=""
                className="min-h-[250px] rounded-t-none border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="attachment" className='cursor-pointer'>Select File ( Optional )</Label>
                <div className="relative">
                <Input 
                    id="attachment" 
                    type="file" 
                    className="sr-only"
                    onChange={handleFileChange}
                />
                <label htmlFor="attachment" className="flex items-center border rounded-md h-10 cursor-pointer">
                    <span className="inline-flex items-center px-3 border-r bg-muted text-sm h-full">
                        Choose File
                    </span>
                    <span className="px-3 text-sm text-muted-foreground truncate flex-1">
                        {fileName}
                    </span>
                </label>
                </div>
            </div>
            <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white text-lg py-6 dark:bg-gray-800 dark:hover:bg-gray-900 dark:text-white">
                Send Now
            </Button>
            </CardContent>
      </Card>
    )
}

const AnnouncementsTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>You have {updateMessages.filter(m => !m.read).length} unread messages.</CardDescription>
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

const ContactsTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Your contact list will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground py-20">Contact management coming soon.</p>
        </CardContent>
    </Card>
)

export default function SendMessageContent() {
  return (
    <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="announcements">
            <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="send_message">Send Message</TabsTrigger>
            </TabsList>

            <TabsContent value="announcements">
                <AnnouncementsTab />
            </TabsContent>

            <TabsContent value="contacts">
                <ContactsTab />
            </TabsContent>

            <TabsContent value="send_message">
                <SendMessageForm />
            </TabsContent>
        </Tabs>
    </div>
  );
}
