
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { PartnerActivationInfo } from '@/types';
import { getActivePartners, deactivatePartner } from '@/app/manage-partner/actions';
import PartnerDetailsDialog from './partner-details-dialog';
import { Badge } from './ui/badge';
import { Eye, MessageSquare, UserX, ArrowUpDown } from 'lucide-react';
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

export default function ManagePartnerContent() {
  const [partners, setPartners] = React.useState<PartnerActivationInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchPartners = React.useCallback(async () => {
    setLoading(true);
    const activePartners = await getActivePartners();
    setPartners(activePartners);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleDeactivate = async (userId: string) => {
    const result = await deactivatePartner(userId);
    if (result.success) {
      toast({ title: 'Success', description: 'Partner has been deactivated.' });
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-28" /></div></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /></div></TableCell>
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
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">Manage Partners</h1>
            <p className="text-muted-foreground">View, message, or deactivate active partners.</p>
        </div>
      </div>
      
      <Card>
          <CardContent className='p-0'>
             {partners.length > 0 ? (
                 <Table>
                     <TableHeader>
                         <TableRow>
                             <TableHead><button className="flex items-center gap-1">Partner <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                             <TableHead className="hidden sm:table-cell"><button className="flex items-center gap-1">Partner ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                             <TableHead>Status</TableHead>
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
                                        <div className='flex flex-col'>
                                            <span className='font-medium'>{user.name}</span>
                                            <span className='text-xs text-muted-foreground'>{user.email}</span>
                                        </div>
                                     </div>
                                 </TableCell>
                                 <TableCell className="hidden sm:table-cell">{user.partnerCode || 'N/A'}</TableCell>
                                 <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                                 <TableCell className="text-right">
                                     <div className="flex justify-end gap-2">
                                        <PartnerDetailsDialog partnerInfo={{ user, profile }}>
                                            <Button variant="ghost" size="icon" title="View Profile">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </PartnerDetailsDialog>
                                        <Button variant="ghost" size="icon" title="Message Partner" onClick={() => router.push('/updates')}>
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" title="Deactivate Partner" className="text-destructive hover:text-destructive">
                                                    <UserX className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will deactivate {user.name}. They will not be able to log in until their account is reactivated.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeactivate(user.id)}>
                                                    Deactivate
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
                    <h3 className="text-lg font-medium">No Active Partners</h3>
                    <p className="text-muted-foreground">There are currently no active partners.</p>
                </div>
             )}
          </CardContent>
      </Card>
    </div>
  );
}
