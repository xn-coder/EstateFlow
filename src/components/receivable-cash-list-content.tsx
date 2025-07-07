
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, Printer, CheckCircle, ArrowUpDown, ArrowLeft } from 'lucide-react';
import { Badge } from './ui/badge';
import type { Receivable } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getReceivables, updateReceivableStatus } from '@/app/wallet-billing/actions';
import { Skeleton } from './ui/skeleton';

export default function ReceivableCashListContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [receivableItems, setReceivableItems] = React.useState<Receivable[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchReceivables = React.useCallback(async () => {
    setLoading(true);
    const data = await getReceivables();
    setReceivableItems(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);


  const getStatusBadgeVariant = (status: Receivable['status']) => {
    return status === 'Received' ? 'success' : 'destructive';
  }

  const handleMarkAsReceived = async (id: string) => {
    const originalItems = [...receivableItems];
    // Optimistic update
    setReceivableItems(prev => prev.map(item => item.id === id ? { ...item, status: 'Received' } : item));

    const result = await updateReceivableStatus(id, 'Received');
    if (result.success) {
      toast({ title: 'Success', description: 'Status updated to Received.' });
      fetchReceivables(); // Refetch to confirm
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setReceivableItems(originalItems); // Revert on failure
    }
  };

  const handleViewDetails = () => {
    toast({ title: 'Info', description: 'View Details functionality is not yet implemented.' });
  };

  const handlePrintInvoice = () => {
    toast({ title: 'Info', description: 'Print Invoice functionality is not yet implemented.' });
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push('/wallet-billing')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div>
              <CardTitle>Receivable Cash List</CardTitle>
              <CardDescription>A list of pending payments from partners.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              <Input placeholder="Search by partner..." className="pl-10 bg-white dark:bg-background" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Partner Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead className="hidden md:table-cell"><button className="flex items-center gap-1">Partner ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Pending Amount <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      </TableRow>
                    ))
                ) : receivableItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No receivable items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  receivableItems.map((item) => (
                      <TableRow key={item.id}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="font-medium">{item.partnerName}</TableCell>
                          <TableCell className="hidden md:table-cell">{item.partnerId}</TableCell>
                          <TableCell>
                            {item.pendingAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-green-600 h-8 w-8" title="Mark as Received" onClick={() => handleMarkAsReceived(item.id)} disabled={item.status === 'Received'}>
                                  <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8" title="View Details" onClick={handleViewDetails}>
                                  <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8" title="Print Invoice" onClick={handlePrintInvoice}>
                                  <Printer className="h-4 w-4" />
                              </Button>
                          </TableCell>
                      </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-muted-foreground gap-4 sm:gap-0">
            <div>Showing 1 to {receivableItems.length} of {receivableItems.length} entries</div>
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
