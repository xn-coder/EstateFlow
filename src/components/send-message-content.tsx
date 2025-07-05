
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Bold, Italic, Underline, Link as LinkIcon, FileImage, Code2, HelpCircle, List, ListOrdered, ListChecks, Paintbrush, Pilcrow, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


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

export default function SendMessageContent() {
  const [fileName, setFileName] = React.useState('No file chosen');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('No file chosen');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
    </div>
  );
}
