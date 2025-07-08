

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, ArrowLeft, Copy, FileDown, Printer } from 'lucide-react';
import { Badge } from './ui/badge';
import type { PaymentHistory, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getPaymentHistory } from '@/app/wallet-billing/actions';
import { Skeleton } from './ui/skeleton';

interface PaymentHistoryContentProps {
  currentUser: User;
}

export default function PaymentHistoryContent({ currentUser }: PaymentHistoryContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentHistory, setPaymentHistory] = React.useState<PaymentHistory[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    const sellerId = currentUser.role === 'Seller' ? currentUser.id : undefined;
    const data = await getPaymentHistory(sellerId);
    setPaymentHistory(data);
    setLoading(false);
  }, [currentUser]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  const handleCopy = () => {
    const header = ['Date', 'Name', 'Transaction ID', 'Amount', 'Payment Method', 'Type'];
    const rows = paymentHistory.map(item => 
        [item.date, item.name, item.transactionId, item.amount.toString(), item.paymentMethod, item.type]
    );
    const tsv = [header.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsv).then(() => {
        toast({ title: 'Success', description: 'Payment history copied to clipboard.' });
    }, (err) => {
        toast({ title: 'Error', description: 'Failed to copy to clipboard.', variant: 'destructive'});
        console.error('Could not copy text: ', err);
    });
  };

  const handleDownloadCSV = () => {
    const header = ['Date', 'Name', 'Transaction ID', 'Amount', 'Payment Method', 'Type'];
    const rows = paymentHistory.map(item => 
        [item.date, item.name, item.transactionId, item.amount, item.paymentMethod, item.type]
    );
    let csvContent = "data:text/csv;charset=utf-8," 
        + header.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payment_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Success', description: 'Downloading payment history as CSV.' });
  };
  
  const handlePrint = () => {
    toast({ title: 'Info', description: 'Opening print view...' });
    sessionStorage.setItem('paymentHistoryData', JSON.stringify(paymentHistory));
    window.open('/payment-history/print', '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push('/wallet-billing')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>A complete log of all your wallet transactions.</CardDescription>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={loading}>
                <Copy className="mr-2 h-4 w-4"/>
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCSV} disabled={loading}>
                <FileDown className="mr-2 h-4 w-4"/>
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCSV} disabled={loading}>
                <FileDown className="mr-2 h-4 w-4"/>
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={loading}>
                <Printer className="mr-2 h-4 w-4"/>
                Print
              </Button>
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
              <Input placeholder="Search..." className="pl-10 bg-white dark:bg-background" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead className="hidden md:table-cell"><button className="flex items-center gap-1">Transaction ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Amount <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      </TableRow>
                    ))
                ) : (
                  paymentHistory.map((item) => (
                      <TableRow key={item.id}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{item.transactionId}</TableCell>
                          <TableCell className={item.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                            {item.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                          </TableCell>
                          <TableCell>{item.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge variant={item.type === 'Credit' ? 'secondary' : 'destructive'}>{item.type}</Badge>
                          </TableCell>
                      </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-muted-foreground gap-4 sm:gap-0">
            <div>Showing 1 to {paymentHistory.length} of {paymentHistory.length} entries</div>
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
