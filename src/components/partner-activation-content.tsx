'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { PartnerActivationInfo, User } from '@/types';
import { getPendingPartners, activatePartner, deletePendingPartner } from '@/app/partner-activation/actions';
import PartnerDetailsDialog from './partner-details-dialog';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';
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

export default function PartnerActivationContent() {
  const [partners, setPartners] = React.useState<PartnerActivationInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

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


  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-72" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">Partner Activation</h1>
            <p className="text-muted-foreground">Review and activate new partner registrations.</p>
        </div>
      </div>
      
      {partners.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map(({ user, profile }) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
               <CardContent>
                <Badge variant="secondary" className="flex items-center w-fit">
                    <Clock className="h-3 w-3 mr-1.5" />
                    Pending Activation
                </Badge>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
                <PartnerDetailsDialog partnerInfo={{ user, profile }} onActivate={handleActivate}>
                    <Button>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Activate
                    </Button>
                </PartnerDetailsDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
            <CardContent>
                <h3 className="text-lg font-medium">No Pending Activations</h3>
                <p className="text-muted-foreground">There are currently no new partners awaiting activation.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
