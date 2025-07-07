'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, Info, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supportTickets } from '@/lib/data';

const StatCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function SupportTicketContent() {
  const { toast } = useToast();
  
  const handleActionClick = (action: string, ticketId: string) => {
    toast({
        title: 'Action Triggered',
        description: `${action} clicked for ticket ${ticketId}.`,
    });
  };

  const latestTickets = supportTickets.filter(t => t.status === 'Latest').length;
  const processingTickets = supportTickets.filter(t => t.status === 'Processing').length;
  const solvedTickets = supportTickets.filter(t => t.status === 'Solved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Latest" value={latestTickets.toString()} description="Ticket" />
        <StatCard title="Processing" value={processingTickets.toString()} description="Ticket" />
        <StatCard title="Solved" value={solvedTickets.toString()} description="Ticket" />
        <StatCard title="Associate" value="10" description="Team" />
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-auto bg-white dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground hidden md:inline-block">entries per page</span>
            </div>
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 bg-white dark:bg-background" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Ticket ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">User Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">User Type <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Support For <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Action <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                        <TableCell>{ticket.ticketId}</TableCell>
                        <TableCell>{ticket.date}</TableCell>
                        <TableCell>{ticket.userName}</TableCell>
                        <TableCell>{ticket.userType}</TableCell>
                        <TableCell>{ticket.supportFor}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="bg-orange-400 hover:bg-orange-500 text-white h-6 w-6" onClick={() => handleActionClick('View Details', ticket.ticketId)}>
                                <Info className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="bg-red-500 hover:bg-red-600 text-white h-6 w-6" onClick={() => handleActionClick('View History', ticket.ticketId)}>
                                <Clock className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="bg-green-500 hover:bg-green-600 text-white h-6 w-6" onClick={() => handleActionClick('Mark Solved', ticket.ticketId)}>
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-muted-foreground gap-4 sm:gap-0">
            <div>Showing 1 to {supportTickets.length} of {supportTickets.length} entries</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>«</Button>
              <Button variant="outline" size="sm" disabled>‹</Button>
              <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20">1</Button>
              <Button variant="outline" size="sm" disabled>›</Button>
              <Button variant="outline" size="sm" disabled>»</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
