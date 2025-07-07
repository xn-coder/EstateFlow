
'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, CalendarIcon, Info } from 'lucide-react';
import type { SupportTicket, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { updateTicketStatus } from '@/app/support-ticket/actions';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';

const resolveSchema = z.object({
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().optional(),
  feedback: z.string().optional(),
  resolutionDetails: z.string().optional(),
});

type ResolveFormValues = z.infer<typeof resolveSchema>;

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);
  
interface ProcessTicketContentProps {
  ticket: SupportTicket;
  currentUser: User;
  onUpdate: () => void;
}

export default function ProcessTicketContent({ ticket, currentUser, onUpdate }: ProcessTicketContentProps) {
    const { toast } = useToast();
    
    const form = useForm<ResolveFormValues>({
        resolver: zodResolver(resolveSchema),
        defaultValues: {
            resolvedAt: ticket.resolvedAt ? parseISO(ticket.resolvedAt) : undefined,
            resolvedBy: ticket.resolvedBy || currentUser.name,
            feedback: ticket.feedback || '',
            resolutionDetails: ticket.resolutionDetails || '',
        }
    });

    const handleStatusUpdate = async (status: 'Processing' | 'Solved') => {
        const result = await updateTicketStatus({ ticketId: ticket.id, status });
        if (result.success) {
            toast({ title: 'Status Updated', description: `Ticket marked as ${status}.`});
            onUpdate();
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive'});
        }
    }

    const onResolveSubmit = async (values: ResolveFormValues) => {
        const result = await updateTicketStatus({
            ticketId: ticket.id,
            status: 'Solved',
            resolutionData: {
                resolvedAt: values.resolvedAt?.toISOString(),
                resolvedBy: values.resolvedBy,
                feedback: values.feedback,
                resolutionDetails: values.resolutionDetails,
            }
        });

        if (result.success) {
            toast({ title: 'Ticket Resolved', description: 'The ticket has been marked as resolved with your notes.' });
            onUpdate();
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage src={'https://placehold.co/48x48.png'} alt={ticket.userName} data-ai-hint="person" />
                        <AvatarFallback>{ticket.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-lg font-bold">{ticket.userName}</h2>
                        <p className="text-sm text-muted-foreground">Ticket ID : {ticket.ticketId}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <Info className="h-5 w-5" />
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{ticket.message}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
                    <span>Date : {format(parseISO(ticket.createdAt), 'dd MMM yyyy')}</span>
                    <span>Time : {format(parseISO(ticket.createdAt), 'hh:mm:ss a')}</span>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-between h-12 text-base"><Mail />Send Message</Button>
            <Button variant="outline" className="justify-between h-12 text-base"><WhatsAppIcon />WhatsApp</Button>
            <Button variant="outline" className="justify-between h-12 text-base"><Phone />Call Now</Button>
        </div>

        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onResolveSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Resolve Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField control={form.control} name="resolvedAt" render={({ field }) => (
                                <FormItem><FormLabel>Resolved Date</FormLabel><Popover>
                                    <PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    </Button></FormControl></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                                </Popover><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="resolvedBy" render={({ field }) => ( <FormItem><FormLabel>Support Team Name</FormLabel><FormControl><Input placeholder="Enter Support Team Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                             <FormField control={form.control} name="feedback" render={({ field }) => ( <FormItem><FormLabel>Feedback Details</FormLabel><FormControl><Input placeholder="Enter Feedback Openion" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                        <FormField control={form.control} name="resolutionDetails" render={({ field }) => ( <FormItem><FormLabel>Ticket Details</FormLabel><FormControl><Textarea placeholder="Write a Ticket Details" {...field} className="min-h-32" /></FormControl><FormMessage /></FormItem> )} />

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button type="button" onClick={() => handleStatusUpdate('Processing')} className="w-full sm:w-auto flex-1 bg-orange-500 hover:bg-orange-600">Processing</Button>
                            <Button type="submit" className="w-full sm:w-auto flex-1 bg-green-500 hover:bg-green-600">Resolved Now</Button>
                            <Button type="button" onClick={() => form.reset()} className="w-full sm:w-auto flex-1 bg-red-500 hover:bg-red-600">Reset Details</Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </FormProvider>
    </div>
  );
}
