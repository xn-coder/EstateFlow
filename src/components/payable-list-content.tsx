
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, Printer, CheckCircle, ArrowUpDown, ArrowLeft, PlusCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import type { Payable, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getPayables, updatePayableStatus } from '@/app/wallet-billing/actions';
import { Skeleton } from './ui/skeleton';
import AddPayableDialog from './add-payable-dialog';
import ViewPayableDetailsDialog from './view-payable-details-dialog';

interface PayableListContentProps {
  currentUser: User;
}

export default function PayableListContent({ currentUser }: PayableListContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [payableItems, setPayableItems] = React.useState<Payable[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchPayables = React.useCallback(async () => {
    setLoading(true);
    const data = await getPayables();
    setPayableItems(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPayables();
  }, [fetchPayables]);


  const getStatusBadgeVariant = (status: Payable['status']) => {
    return status === 'Paid' ? 'success' : 'destructive';
  }

  const handleMarkAsPaid = async (id: string) => {
    const originalItems = [...payableItems];
    // Optimistic update
    setPayableItems(prev => prev.map(item => item.id === id ? { ...item, status: 'Paid' } : item));
    
    const result = await updatePayableStatus(id, 'Paid');
    if (result.success) {
      toast({ title: 'Success', description: 'Status updated to Paid.' });
      fetchPayables();
    } else {
       toast({ title: 'Error', description: result.error, variant: 'destructive' });
       setPayableItems(originalItems);
    }
  };

  const handlePrintInvoice = () => {
    toast({ title: 'Info', description: 'Print Invoice functionality is not yet implemented.' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push('/wallet-billing')}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                <CardTitle>Payable List</CardTitle>
                <CardDescription>A list of outstanding payments to be made.</CardDescription>
                </div>
            </div>
             <AddPayableDialog currentUser={currentUser} onPaymentSuccess={fetchPayables}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Payment
                </Button>
            </AddPayableDialog>
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
              <Input placeholder="Search by recipient..." className="pl-10 bg-white dark:bg-background" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Recipient Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead className="hidden md:table-cell"><button className="flex items-center gap-1">Recipient ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Payable Amount <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {loading ? (
                   Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      </TableRow>
                    ))
                ) : payableItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No payable items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payableItems.map((item) => (
                      <TableRow key={item.id}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="font-medium">{item.recipientName}</TableCell>
                          <TableCell className="hidden md:table-cell">{item.recipientId}</TableCell>
                          <TableCell>
                            {item.payableAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-green-600 h-8 w-8" title="Mark as Paid" onClick={() => handleMarkAsPaid(item.id)} disabled={item.status === 'Paid'}>
                                  <CheckCircle className="h-4 w-4" />
                              </Button>
                              <ViewPayableDetailsDialog payable={item}>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8" title="View Details">
                                    <Eye className="h-4 w-4" />
                                </Button>
                              </ViewPayableDetailsDialog>
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
            <div>Showing 1 to {payableItems.length} of {payableItems.length} entries</div>
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
