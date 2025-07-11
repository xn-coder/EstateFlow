

'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from './ui/skeleton';
import { getCustomers } from '@/app/manage-customers/actions';
import { getUsers } from '@/app/login/actions';
import type { Customer, User } from '@/types';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { Button } from './ui/button';

interface ManageCustomersContentProps {
  currentUser: User;
}

export default function ManageCustomersContent({ currentUser }: ManageCustomersContentProps) {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [userMap, setUserMap] = React.useState<Map<string, string>>(new Map());
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('partnerId');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
        const sellerId = currentUser?.role === 'Seller' ? currentUser.id : undefined;
        const [customerData, userData] = await Promise.all([
            getCustomers(partnerId || undefined, sellerId),
            getUsers()
        ]);
        setCustomers(customerData);

        const newMap = new Map<string, string>();
        userData.forEach(user => {
            if (user.id && user.partnerCode) {
                newMap.set(user.id, user.partnerCode);
            }
        });
        setUserMap(newMap);
    } catch (err) {
        toast({
            title: "Error",
            description: "Failed to fetch customer data.",
            variant: "destructive"
        })
    }
    setLoading(false);
  }, [toast, partnerId, currentUser]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
           <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
              </Button>
              <div>
                  <CardTitle>Manage Customers</CardTitle>
                  <CardDescription>View all customers created by partners.</CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end mb-4">
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-10 bg-white dark:bg-background" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Customer ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell"><button className="flex items-center gap-1">Created By <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    </TableRow>
                  ))
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-mono text-xs">{customer.customerId}</TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{customer.email}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{customer.phone}</TableCell>
                      <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">{userMap.get(customer.createdBy) || customer.createdBy}</TableCell>
                      <TableCell>{format(parseISO(customer.createdAt), 'dd MMM yyyy, p')}</TableCell>
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
