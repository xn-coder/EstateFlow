
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, Info } from 'lucide-react';
import { getSupportTickets } from '@/app/support-ticket/actions';
import type { SupportTicket } from '@/types';
import { format, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';

const StatCard = ({ title, value, description, loading }: { title: string; value: string; description: string, loading: boolean }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
        {loading ? (
            <Skeleton className="h-10 w-3/4 mb-1" />
        ) : (
            <p className="text-4xl font-bold">{value}</p>
        )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function SupportTicketContent() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchTickets = React.useCallback(async () => {
    setLoading(true);
    const data = await getSupportTickets();
    setTickets(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  
  const latestTickets = tickets.filter(t => t.status === 'Latest').length;
  const processingTickets = tickets.filter(t => t.status === 'Processing').length;
  const solvedTickets = tickets.filter(t => t.status === 'Solved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Latest" value={latestTickets.toString()} description="Ticket" loading={loading} />
        <StatCard title="Processing" value={processingTickets.toString()} description="Ticket" loading={loading} />
        <StatCard title="Solved" value={solvedTickets.toString()} description="Ticket" loading={loading} />
        <StatCard title="Associate" value="10" description="Team" loading={loading} />
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
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                    </TableRow>
                  ))
                ) : tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                            <TableCell>{ticket.ticketId}</TableCell>
                            <TableCell>{format(parseISO(ticket.createdAt), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{ticket.userName}</TableCell>
                            <TableCell>{ticket.userType}</TableCell>
                            <TableCell>{`${ticket.queryCategory} - ${ticket.subject}`}</TableCell>
                            <TableCell>
                              <Button asChild variant="ghost" size="icon" className="bg-orange-400 hover:bg-orange-500 text-white h-6 w-6">
                                <Link href={`/support-ticket/${ticket.id}`}>
                                  <Info className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No support tickets found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-muted-foreground gap-4 sm:gap-0">
            <div>Showing 1 to {tickets.length} of {tickets.length} entries</div>
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
