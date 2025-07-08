
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { getRewardPointHistory } from '@/app/wallet-billing/actions';
import type { RewardPointTransaction, User } from '@/types';
import { format, parseISO } from 'date-fns';
import { Badge } from './ui/badge';

export default function RewardPointsHistoryContent({ currentUser }: { currentUser: User }) {
  const router = useRouter();
  const [history, setHistory] = React.useState<RewardPointTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchHistory() {
      if (currentUser?.id) {
        setLoading(true);
        const data = await getRewardPointHistory(currentUser.id);
        setHistory(data);
        setLoading(false);
      }
    }
    fetchHistory();
  }, [currentUser]);

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
              <CardTitle>Reward Points History</CardTitle>
              <CardDescription>A log of all your reward point transactions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No reward point transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(parseISO(item.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.sellerName}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.type === 'Credit' ? 'success' : 'destructive'} className="font-semibold">
                          {item.type === 'Credit' ? '+' : '-'} {item.points}
                        </Badge>
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
