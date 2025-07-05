'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { PartnerActivationInfo } from '@/types';
import { getDeactivatedPartners, reactivatePartner } from '@/app/deactivated-partner/actions';
import { Badge } from './ui/badge';
import { UserCheck } from 'lucide-react';
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

export default function DeactivatedPartnerContent() {
  const [partners, setPartners] = React.useState<PartnerActivationInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchPartners = React.useCallback(async () => {
    setLoading(true);
    const deactivatedPartners = await getDeactivatedPartners();
    setPartners(deactivatedPartners);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleReactivate = async (userId: string) => {
    const result = await reactivatePartner(userId);
    if (result.success) {
      toast({ title: 'Success', description: 'Partner has been reactivated.' });
      fetchPartners(); // Refresh the list
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
            <h1 className="text-2xl font-bold">Deactivated Partners</h1>
            <p className="text-muted-foreground">View and reactivate partners.</p>
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
                    <CardDescription>{user.partnerCode || user.id}</CardDescription>
                  </div>
                </div>
              </CardHeader>
               <CardContent>
                <Badge variant="destructive">Deactivated</Badge>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reactivate {user.name}. They will be able to log in and access the platform again.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleReactivate(user.id)}>
                            Reactivate
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
            <CardContent>
                <h3 className="text-lg font-medium">No Deactivated Partners</h3>
                <p className="text-muted-foreground">There are currently no deactivated partners.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
