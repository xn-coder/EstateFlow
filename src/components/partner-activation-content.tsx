
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { PartnerActivationInfo, User } from '@/types';
import { getPendingPartners, activatePartner, deletePendingPartner, approveFeePayment } from '@/app/partner-activation/actions';
import PartnerDetailsDialog from './partner-details-dialog';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, Trash2, ArrowUpDown, ArrowLeft } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useRouter } from 'next/navigation';

export default function PartnerActivationContent() {
  const [partners, setPartners] = React.useState<PartnerActivationInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchPartners = React.useCallback(async () => {
    setLoading(true);
    const pendingPartners = await getPendingPartners();
    setPartners(pendingPartners);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleActivate = async (userId: string) => {
    const result = await activatePartner(userId);
    if (result.success) {
      toast({ title: 'Success', description: 'Partner has been activated.' });
      fetchPartners(); // Refresh the list
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDelete = async (user: User) => {
    if (!user.partnerProfileId) {
      toast({
        title: 'Error',
        description: 'Cannot delete partner, profile ID is missing.',
        variant: 'destructive',
      });
      return;
    }
    const result = await deletePendingPartner(user.id, user.partnerProfileId);
    if (result.success) {
      toast({ title: 'Success', description: 'Partner registration deleted.' });
      fetchPartners();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleApprovePayment = async (userId: string) => {
    const result = await approveFeePayment(userId);
    if (result.success) {
      toast({ title: 'Success', description: 'Payment approved. You can now activate this partner.' });
      fetchPartners(); // Refresh the list
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
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-28" /></div></TableCell>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                     <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell><div className="flex justify-end gap-2"><Skeleton className="h-10 w-10 rounded-md" /><Skeleton className="h-10 w-32 rounded-md" /></div></TableCell>
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
                        <CardTitle>Partner Activation</CardTitle>
                        <CardDescription>Review and activate new partner registrations.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {partners.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><button className="flex items-center gap-1">Partner <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                                <TableHead className="hidden sm:table-cell"><button className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Fee Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.map(({ user, profile }) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className='flex items-center gap-2'>
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-muted-foreground">{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="flex items-center w-fit">
                                        <Clock className="h-3 w-3 mr-1.5" />
                                        Pending
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.feeStatus === 'Paid' ? 'success' : user.feeStatus === 'Not Applicable' ? 'secondary' : 'destructive'}>
                                        {user.feeStatus || 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the registration for {user.name}.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className={cn(buttonVariants({ variant: "destructive" }))}
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <PartnerDetailsDialog partnerInfo={{ user, profile }} onActivate={handleActivate} onApprovePayment={handleApprovePayment}>
                                            <Button size="sm">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Review & Activate
                                            </Button>
                                        </PartnerDetailsDialog>
                                </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-medium">No Pending Activations</h3>
                        <p className="text-muted-foreground">There are currently no new partners awaiting activation.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
