'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Eye, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUsers } from '@/app/login/actions';
import type { User } from '@/types';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function ContactBookSkeleton() {
    return (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div>
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24 mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ContactBookContent() {
  const [partners, setPartners] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchPartners() {
        setLoading(true);
        try {
            const allUsers = await getUsers();
            const partnerUsers = allUsers.filter(user => user.role === 'Partner');
            setPartners(partnerUsers);
        } catch (error) {
            console.error("Failed to fetch partners:", error);
            toast({
                title: 'Error',
                description: 'Could not load the contact book.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }
    fetchPartners();
  }, [toast]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Input placeholder="Search Partner" className="flex-grow border-r-0 rounded-r-none h-11" />
            <Button className="rounded-l-none h-11 bg-gray-800 hover:bg-gray-900 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {loading ? <ContactBookSkeleton /> : (
          <Card>
            <CardContent className="p-0">
            {partners.length > 0 ? (
              <div className="divide-y">
                {partners.map((partner) => (
                  <div key={partner.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={partner.avatar} alt={partner.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">{partner.partnerCode || partner.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Link href={`/manage-partner/${partner.id}`}>
                          <Eye className="h-5 w-5" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Link href={`/updates?recipientId=${partner.email}`}>
                          <Mail className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-lg font-medium">No Partners Found</h3>
                    <p className="text-muted-foreground">There are no registered partners in the system.</p>
                </div>
            )}
            </CardContent>
          </Card>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button variant="outline">
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
