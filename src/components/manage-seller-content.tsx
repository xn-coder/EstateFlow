
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import { getSellers, toggleSellerStatus } from '@/app/manage-seller/actions';
import { Badge } from './ui/badge';
import { MessageSquare, UserX, ArrowUpDown, ArrowLeft, UserCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export default function ManageSellerContent() {
  const [sellers, setSellers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchSellers = React.useCallback(async () => {
    setLoading(true);
    const sellersData = await getSellers();
    setSellers(sellersData);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleToggleStatus = async (seller: User) => {
    const currentStatus = seller.status === 'Active' ? 'Active' : 'Deactivated';
    const result = await toggleSellerStatus(seller.id, currentStatus);
    const actionText = currentStatus === 'Active' ? 'deactivated' : 'activated';
    if (result.success) {
      toast({ title: 'Success', description: `Seller has been ${actionText}.` });
      fetchSellers(); // Refresh the list
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-72" />
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-28" /></div></TableCell>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /></div></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push('/manage-business')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <div>
                        <CardTitle>Manage Sellers</CardTitle>
                        <CardDescription>View, message, or deactivate active sellers.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-0'>
                {sellers.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><button className="flex items-center gap-1">Seller <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                                <TableHead className="hidden sm:table-cell"><button className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sellers.map((seller) => (
                                <TableRow key={seller.id}>
                                    <TableCell>
                                        <div className='flex items-center gap-2'>
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage src={seller.avatar} alt={seller.name} />
                                                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className='flex flex-col'>
                                                <span className='font-medium'>{seller.name}</span>
                                                <span className='text-xs text-muted-foreground'>{seller.userCode}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground">{seller.email}</TableCell>
                                    <TableCell><Badge variant={seller.status === 'Active' ? "secondary" : "destructive"}>{seller.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" title="Message Seller" onClick={() => router.push(`/updates?recipientId=${seller.email}`)}>
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" title={seller.status === 'Active' ? 'Deactivate Seller' : 'Activate Seller'} className={seller.status === 'Deactivated' ? 'text-green-500 hover:text-green-600' : 'text-destructive hover:text-destructive'}>
                                                        {seller.status === 'Active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will {seller.status === 'Active' ? 'deactivate' : 'activate'} {seller.name}.
                                                        {seller.status === 'Active' ? ' They will not be able to log in.' : ' They will be able to log in again.'}
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleToggleStatus(seller)}>
                                                        {seller.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-medium">No Sellers Found</h3>
                        <p className="text-muted-foreground">There are currently no registered sellers.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
