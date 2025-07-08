

'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getEnquiries } from '@/app/manage-orders/actions';
import type { SubmittedEnquiry } from '@/types';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import ConfirmOrderDialog from './confirm-order-dialog';

export default function ManageOrdersContent() {
  const [enquiries, setEnquiries] = React.useState<SubmittedEnquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('partnerId');

  const fetchEnquiries = React.useCallback(async () => {
    setLoading(true);
    const data = await getEnquiries(partnerId || undefined);
    setEnquiries(data);
    setLoading(false);
  }, [partnerId]);

  React.useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const getStatusBadgeVariant = (status: SubmittedEnquiry['status']) => {
    switch (status) {
      case 'New': return 'destructive';
      case 'Contacted': return 'secondary';
      case 'Confirmed': return 'success';
      case 'Closed': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
          <CardDescription>View and manage all customer enquiries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Enquiry ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Catalog</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : enquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No enquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-mono text-xs">{enquiry.enquiryId}</TableCell>
                      <TableCell>{format(parseISO(enquiry.createdAt), 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        <div className="font-medium">{enquiry.customerName}</div>
                        <div className="text-xs text-muted-foreground">{enquiry.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{enquiry.catalogTitle}</div>
                        <div className="text-xs text-muted-foreground">{enquiry.catalogCode}</div>
                      </TableCell>
                      <TableCell>{enquiry.submittedBy.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(enquiry.status)}>{enquiry.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {(enquiry.status === 'New' || enquiry.status === 'Contacted') && (
                          <ConfirmOrderDialog enquiry={enquiry} onOrderConfirmed={fetchEnquiries}>
                             <Button size="sm">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                             </Button>
                          </ConfirmOrderDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
